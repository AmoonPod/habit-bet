"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HabitCharts: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Replace with your actual chart component */}
          <p>Interactive Chart Here</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Replace with your actual heatmap component */}
          <p>Interactive Heatmap Here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitCharts;
