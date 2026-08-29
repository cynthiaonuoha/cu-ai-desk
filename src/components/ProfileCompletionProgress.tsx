
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";

interface ProfileCompletionProgressProps {
  completionPercentage: number;
  completedFields: string[];
  totalFields: string[];
}

const ProfileCompletionProgress = ({ 
  completionPercentage, 
  completedFields, 
  totalFields 
}: ProfileCompletionProgressProps) => {
  const getBadgeColor = () => {
    if (completionPercentage === 100) return "bg-green-500";
    if (completionPercentage >= 75) return "bg-blue-500";
    if (completionPercentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getBadgeText = () => {
    if (completionPercentage === 100) return "Profile Complete! 🎉";
    if (completionPercentage >= 75) return "Almost There! 💪";
    if (completionPercentage >= 50) return "Getting There! 📈";
    return "Just Getting Started 🚀";
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-purple-800">Profile Completion</h3>
            <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getBadgeColor()}`}>
              {completionPercentage}%
            </div>
          </div>
          
          <Progress value={completionPercentage} className="h-3" />
          
          <p className="text-sm text-purple-600 font-medium">
            {getBadgeText()}
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            {totalFields.map((field) => (
              <div key={field} className="flex items-center gap-2">
                {completedFields.includes(field) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
                <span className={completedFields.includes(field) ? "text-green-600" : "text-gray-500"}>
                  {field}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionProgress;
