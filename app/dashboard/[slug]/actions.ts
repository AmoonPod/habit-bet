"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
    differenceInDays,
    endOfDay,
    endOfMonth,
    endOfWeek,
    startOfDay,
    startOfMonth,
    startOfWeek,
} from "date-fns";

export async function checkInHabit(
    habit_uuid: string,
    completed: boolean,
    proofContent?: string,
    proofFile?: File,
    checkInDate?: Date,
    isMissedCheckIn: boolean = false,
): Promise<
    { success: boolean; message?: string; forfeitAmount?: number; error?: any }
> {
    const supabase = await createClient();

    try {
        // Get verification type from habit
        const { data: habitData, error: habitError } = await supabase
            .from("habits")
            .select("verification_type, slug, frequency_unit, frequency_value")
            .eq("uuid", habit_uuid)
            .single();

        if (habitError) {
            console.error("Error fetching habit data:", habitError);
            return {
                success: false,
                message: "Failed to fetch habit data",
                error: habitError,
            };
        }

        const verificationType = habitData?.verification_type || "honor";
        const habitSlug = habitData?.slug;
        const frequencyUnit = habitData?.frequency_unit || "day";
        const frequencyValue = habitData?.frequency_value || 1;

        // Use provided date or current date
        const checkInDateTime = checkInDate || new Date();

        // Check if the user has already reached their check-in quota for the specific date
        let startDate, endDate;

        if (frequencyUnit === "day") {
            startDate = startOfDay(checkInDateTime);
            endDate = endOfDay(checkInDateTime);
        } else if (frequencyUnit === "week") {
            startDate = startOfWeek(checkInDateTime, { weekStartsOn: 1 }); // Start week on Monday
            endDate = endOfWeek(checkInDateTime, { weekStartsOn: 1 });
        } else { // month
            startDate = startOfMonth(checkInDateTime);
            endDate = endOfMonth(checkInDateTime);
        }

        // Get existing check-ins for this period
        const { data: existingCheckins, error: checkinsError } = await supabase
            .from("habit_checkins")
            .select("*")
            .eq("habit_uuid", habit_uuid)
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());

        if (checkinsError) {
            console.error("Error fetching existing check-ins:", checkinsError);
            return {
                success: false,
                message: "Failed to check existing check-ins",
                error: checkinsError,
            };
        }

        // If the user has already reached their check-in quota, prevent further check-ins
        if (existingCheckins && existingCheckins.length >= frequencyValue) {
            return {
                success: false,
                message:
                    `You've already completed your ${frequencyValue} check-in(s) for this ${frequencyUnit}`,
            };
        }

        let finalProofContent = proofContent || null;

        // Handle file upload for photo verification
        if (verificationType === "photo" && proofFile && completed) {
            try {
                // Generate a unique file name
                const fileName = `${Date.now()}_${
                    proofFile.name.replace(/\s+/g, "_")
                }`;
                const filePath = `habit-proofs/${habit_uuid}/${fileName}`;

                // Upload the file to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from("habit-proofs")
                    .upload(filePath, proofFile, {
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (uploadError) {
                    console.error("Error uploading proof image:", uploadError);
                    return {
                        success: false,
                        message: "Failed to upload proof image",
                        error: uploadError,
                    };
                }

                // Get the public URL for the uploaded file
                const { data: { publicUrl } } = supabase
                    .storage
                    .from("habit-proofs")
                    .getPublicUrl(filePath);

                finalProofContent = publicUrl;
            } catch (uploadError) {
                console.error("Exception during file upload:", uploadError);
                return {
                    success: false,
                    message: "An error occurred during file upload",
                    error: uploadError,
                };
            }
        }

        // Insert the check-in record with the specific date
        const { data, error } = await supabase
            .from("habit_checkins")
            .insert({
                habit_uuid,
                completed: completed ? true : false,
                status: completed.toString(),
                proof_type: verificationType,
                proof_content: finalProofContent,
                proof_verified: verificationType === "honor" ? true : false,
                created_at: checkInDateTime.toISOString(), // Use the specific date
            });

        if (error) {
            console.error("Error inserting check-in:", error);
            return { success: false, message: "Failed to check in", error };
        }

        // If this is a failed check-in, handle stake forfeiture
        let forfeitureResult: {
            success: boolean;
            message?: string;
            forfeitAmount?: number;
            error?: any;
        } = { success: true };

        if (!completed) {
            forfeitureResult = await handleStakeForfeiture(
                habit_uuid,
                completed,
                isMissedCheckIn,
            );
            if (!forfeitureResult.success) {
                console.error(
                    "Error handling stake forfeiture:",
                    forfeitureResult.error,
                );
                // We still want to continue since the check-in was recorded
            }
        }

        // Revalidate the habit page to refresh the data
        if (habitSlug) {
            revalidatePath(`/dashboard/${habitSlug}`);
        }
        revalidatePath("/dashboard");

        return {
            success: true,
            message: forfeitureResult.message,
            forfeitAmount: forfeitureResult.forfeitAmount,
        };
    } catch (error) {
        console.error("Error during check-in:", error);
        return {
            success: false,
            message: "An unexpected error occurred",
            error,
        };
    }
}

export interface EditHabitProps {
    habit_uuid: string;
    name?: string;
    icon?: string;
    color?: string;
    verification_type?: string;
}

export async function editHabit(props: EditHabitProps) {
    const supabase = await createClient();

    // First, check if the habit has any check-ins
    const { data: checkins, error: checkinsError } = await supabase
        .from("habit_checkins")
        .select("uuid")
        .eq("habit_uuid", props.habit_uuid);

    if (checkinsError) {
        throw checkinsError;
    }

    // Get the current habit data
    const { data: habitData, error: habitError } = await supabase
        .from("habits")
        .select("*")
        .eq("uuid", props.habit_uuid)
        .single();

    if (habitError) {
        throw habitError;
    }

    // Create update object with only the fields that are provided
    const updateData: any = {};
    if (props.name) updateData.name = props.name;
    if (props.icon) updateData.icon = props.icon;
    if (props.color) updateData.color = props.color;

    // Special handling for verification_type
    if (props.verification_type) {
        // If there are check-ins, only allow upgrading verification type (making it stricter)
        // honor < text < photo (in terms of strictness)
        if (checkins && checkins.length > 0) {
            const currentType = habitData.verification_type;
            const newType = props.verification_type;

            const strictnessLevel = {
                "honor": 1,
                "text": 2,
                "photo": 3,
            };

            // Only allow changes that increase strictness
            if (
                strictnessLevel[newType as keyof typeof strictnessLevel] >=
                    strictnessLevel[currentType as keyof typeof strictnessLevel]
            ) {
                updateData.verification_type = newType;
            }
        } else {
            // If no check-ins yet, allow any change to verification type
            updateData.verification_type = props.verification_type;
        }
    }

    // If name is changed, update the slug
    if (props.name) {
        updateData.slug = props.name.toLowerCase().replace(/\s/g, "-");
    }

    // Only proceed with update if there are fields to update
    if (Object.keys(updateData).length > 0) {
        const { data, error } = await supabase
            .from("habits")
            .update(updateData)
            .eq("uuid", props.habit_uuid);

        if (error) {
            throw error;
        }

        return { success: true, data };
    }

    return { success: false, message: "No valid fields to update" };
}

export async function deleteHabit(habit_uuid: string) {
    const supabase = await createClient();

    // First, check if the habit has any check-ins
    const { data: checkins, error: checkinsError } = await supabase
        .from("habit_checkins")
        .select("uuid, status")
        .eq("habit_uuid", habit_uuid);

    if (checkinsError) {
        throw checkinsError;
    }

    // Get the habit data to check stake information
    const { data: habitData, error: habitError } = await supabase
        .from("habits")
        .select("*, habit_stakes(*)")
        .eq("uuid", habit_uuid)
        .single();

    if (habitError) {
        throw habitError;
    }

    // If there are check-ins, don't allow deletion
    if (checkins && checkins.length > 0) {
        return {
            success: false,
            message:
                "Cannot delete a habit with existing check-ins. This prevents avoiding consequences of failed habits.",
        };
    }

    // If there's a stake, mark it as cancelled instead of deleting
    if (habitData.stake_uuid) {
        const { error: stakeError } = await supabase
            .from("habit_stakes")
            .update({ status: "cancelled" })
            .eq("uuid", habitData.stake_uuid);

        if (stakeError) {
            throw stakeError;
        }
    }

    // Now delete the habit
    const { error } = await supabase
        .from("habits")
        .delete()
        .eq("uuid", habit_uuid);

    if (error) {
        throw error;
    }

    return { success: true };
}

export async function handleStakeForfeiture(
    habit_uuid: string,
    completed: boolean,
    isMissedCheckIn: boolean = false,
): Promise<
    { success: boolean; message?: string; forfeitAmount?: number; error?: any }
> {
    // If the check-in was successful, no need to handle forfeiture
    if (completed) {
        return { success: true };
    }

    const supabase = await createClient();

    try {
        // Get habit data including stake information
        const { data: habitData, error: habitError } = await supabase
            .from("habits")
            .select("*, habit_stakes(*)")
            .eq("uuid", habit_uuid)
            .single();

        if (habitError) {
            console.error("Error fetching habit data:", habitError);
            return {
                success: false,
                message: "Failed to fetch habit data",
                error: habitError,
            };
        }

        // If there's no stake, nothing to forfeit
        if (!habitData.stake_uuid || !habitData.habit_stakes?.amount) {
            return { success: true };
        }

        // Get all check-ins to calculate failure rate
        const { data: checkins, error: checkinsError } = await supabase
            .from("habit_checkins")
            .select("*")
            .eq("habit_uuid", habit_uuid)
            .order("created_at", { ascending: false });

        if (checkinsError) {
            console.error("Error fetching check-ins:", checkinsError);
            return {
                success: false,
                message: "Failed to fetch check-ins",
                error: checkinsError,
            };
        }

        // Calculate failure rate
        const totalCheckins = checkins?.length || 0;
        const failedCheckins = checkins?.filter((c) =>
            c.status === "false"
        ).length || 0;
        const failureRate = totalCheckins > 0
            ? failedCheckins / totalCheckins
            : 0;

        // Always mark habit as failed when user explicitly admits failure or misses a check-in
        // Mark habit as failed
        const { error: updateError } = await supabase
            .from("habits")
            .update({ status: "failed" })
            .eq("uuid", habit_uuid);

        if (updateError) {
            console.error("Error updating habit status:", updateError);
        }

        // Mark stake as forfeited
        const { error: stakeError } = await supabase
            .from("habit_stakes")
            .update({
                status: "forfeited",
                payment_status: "pending",
                transaction_date: new Date().toISOString(),
            })
            .eq("uuid", habitData.stake_uuid);

        if (stakeError) {
            console.error("Error updating stake status:", stakeError);
        }

        // Create a payment record
        const { error: paymentError } = await supabase
            .from("habit_payments")
            .insert({
                stake_uuid: habitData.stake_uuid,
                habit_uuid: habit_uuid,
                amount: habitData.habit_stakes.amount,
                payment_status: "pending",
            });

        if (paymentError) {
            console.error("Error creating payment record:", paymentError);
        }

        // Determine the failure reason based on the context
        let failureReason;
        if (isMissedCheckIn) {
            failureReason = "You missed a required check-in for your habit.";
        } else if (!completed) {
            failureReason = "You admitted to failing this habit.";
        } else if (failureRate > 0.3) {
            failureReason = `Your failure rate of ${
                (failureRate * 100).toFixed(1)
            }% exceeds the 30% threshold.`;
        } else {
            failureReason = "This habit has been marked as failed.";
        }

        return {
            success: true,
            message:
                `Habit failed: ${failureReason} Your stake has been forfeited and payment is required.`,
            forfeitAmount: habitData.habit_stakes.amount,
        };
    } catch (error) {
        console.error("Error in handleStakeForfeiture:", error);
        return {
            success: false,
            message: "An error occurred while processing the forfeiture",
            error,
        };
    }
}
