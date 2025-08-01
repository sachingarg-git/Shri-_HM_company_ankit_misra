import { File, CalendarPlus, Bell, Plus } from "lucide-react";

const quickActions = [
  {
    title: "Create Credit Agreement",
    description: "Set up new credit terms",
    icon: File,
    color: "hover:border-primary hover:bg-primary/5"
  },
  {
    title: "Extend E-Way Bill", 
    description: "Update delivery dates",
    icon: CalendarPlus,
    color: "hover:border-secondary hover:bg-secondary/5"
  },
  {
    title: "Send Payment Reminder",
    description: "Notify overdue clients", 
    icon: Bell,
    color: "hover:border-warning hover:bg-warning/5"
  },
  {
    title: "Create New Order",
    description: "Start order workflow",
    icon: Plus,
    color: "hover:border-info hover:bg-info/5"
  }
];

export default function QuickActions() {
  const handleQuickAction = (action: string) => {
    // TODO: Implement actual quick action modals/forms
    alert(`Opening ${action} interface...`);
  };

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickActions.map((action, index) => {
        const Icon = action.icon;
        const iconColors = [
          "text-primary bg-primary/10",
          "text-secondary bg-secondary/10", 
          "text-warning bg-warning/10",
          "text-info bg-info/10"
        ];
        
        return (
          <button
            key={index}
            onClick={() => handleQuickAction(action.title)}
            className={`bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center ${action.color} transition-colors`}
          >
            <div className={`w-12 h-12 ${iconColors[index]} rounded-lg mx-auto mb-4 flex items-center justify-center`}>
              <Icon size={24} />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">{action.title}</h4>
            <p className="text-sm text-gray-500">{action.description}</p>
          </button>
        );
      })}
    </div>
  );
}
