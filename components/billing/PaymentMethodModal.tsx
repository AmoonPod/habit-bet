"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, CheckCircle2, Lock } from "lucide-react";

interface PaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PaymentMethodModal({ isOpen, onClose }: PaymentMethodModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvc: ""
    });
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Format card number with spaces
        if (name === "cardNumber") {
            const formatted = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
            setFormData({ ...formData, [name]: formatted.substring(0, 19) });
            return;
        }

        // Format expiry date
        if (name === "expiryDate") {
            let formatted = value.replace(/[^0-9]/g, "");
            if (formatted.length > 2) {
                formatted = `${formatted.substring(0, 2)}/${formatted.substring(2, 4)}`;
            }
            setFormData({ ...formData, [name]: formatted });
            return;
        }

        // Limit CVC to 3-4 digits
        if (name === "cvc") {
            const formatted = value.replace(/[^0-9]/g, "").substring(0, 4);
            setFormData({ ...formData, [name]: formatted });
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulate API call to Polar.sh
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real implementation, you would:
            // 1. Use Polar.sh's API to tokenize the card
            // 2. Send the token to your backend
            // 3. Store the payment method for the user

            setIsSuccess(true);

            setTimeout(() => {
                toast({
                    title: "Payment method updated",
                    description: "Your card has been successfully updated.",
                });
                onClose();
                setIsSuccess(false);
            }, 1500);
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error updating your payment method. Please try again.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[500px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                {isSuccess ? (
                    <div className="py-6 sm:py-8 flex flex-col items-center justify-center">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-green-100 flex items-center justify-center mb-3 sm:mb-4">
                            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">Payment Method Updated</h2>
                        <p className="text-center text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
                            Your new payment method has been successfully added.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="pb-3 sm:pb-4">
                            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span>Update Payment Method</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm">
                                Enter your card details to update your payment method.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 py-1 sm:py-2">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="grid gap-1 sm:gap-2">
                                    <Label htmlFor="cardNumber" className="text-xs sm:text-sm">Card Number</Label>
                                    <div className="relative">
                                        <Input
                                            id="cardNumber"
                                            name="cardNumber"
                                            placeholder="1234 5678 9012 3456"
                                            value={formData.cardNumber}
                                            onChange={handleChange}
                                            className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm"
                                            required
                                        />
                                        <CreditCard className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="grid gap-1 sm:gap-2">
                                    <Label htmlFor="cardName" className="text-xs sm:text-sm">Cardholder Name</Label>
                                    <Input
                                        id="cardName"
                                        name="cardName"
                                        placeholder="John Doe"
                                        value={formData.cardName}
                                        onChange={handleChange}
                                        className="h-9 sm:h-10 text-sm"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                    <div className="grid gap-1 sm:gap-2">
                                        <Label htmlFor="expiryDate" className="text-xs sm:text-sm">Expiry Date</Label>
                                        <Input
                                            id="expiryDate"
                                            name="expiryDate"
                                            placeholder="MM/YY"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            className="h-9 sm:h-10 text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-1 sm:gap-2">
                                        <Label htmlFor="cvc" className="text-xs sm:text-sm">CVC</Label>
                                        <Input
                                            id="cvc"
                                            name="cvc"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="123"
                                            value={formData.cvc}
                                            onChange={handleChange}
                                            className="h-9 sm:h-10 text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 p-1.5 sm:p-2 rounded-md mt-1 sm:mt-2">
                                <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                                <p>Your payment information is encrypted and secure.</p>
                            </div>

                            <DialogFooter className="mt-4 sm:mt-6 pt-2 border-t">
                                <div className="flex flex-col-reverse sm:flex-row sm:justify-end w-full gap-2 sm:gap-3">
                                    <Button type="button" variant="outline" onClick={onClose} className="h-9 sm:h-10 text-xs sm:text-sm">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading} className="h-9 sm:h-10 text-xs sm:text-sm sm:w-auto w-full">
                                        {isLoading ? "Processing..." : "Update Payment Method"}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
} 