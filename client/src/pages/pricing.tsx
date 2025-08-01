import { Check, X, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  // Core Business Management Features
  {
    name: "Credit Payment Automation",
    description: "Automated payment tracking, due date alerts, and overdue notifications",
    basic: true,
    advanced: true,
    premium: true
  },
  {
    name: "Client Categorization (Alfa, Beta, Gamma, Delta)",
    description: "Smart client classification system with custom categories",
    basic: true,
    advanced: true,
    premium: true
  },
  {
    name: "Task Classification (One-time vs Recurring)",
    description: "Comprehensive task management with automatic scheduling",
    basic: "Limited",
    advanced: true,
    premium: true
  },
  {
    name: "Order Workflow Automation",
    description: "Complete order lifecycle from agreement to delivery",
    basic: "Basic",
    advanced: true,
    premium: true
  },
  {
    name: "Credit Agreement Enforcement",
    description: "Automatic credit verification before material loading",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Sales Team PO Access",
    description: "Role-based purchase order management and approval",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "E-way Bill Validity Extension",
    description: "Automated e-way bill management with extension capabilities",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Client-wise Tracking (Vehicle Location & Timeline)",
    description: "Real-time vehicle tracking with delivery timeline updates",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Pending Payment Alerts",
    description: "Smart notification system for payment follow-ups",
    basic: "Email only",
    advanced: "Multi-channel",
    premium: "Advanced AI"
  },
  {
    name: "Client-wise Sales Rate Display",
    description: "Dynamic pricing and rate management per client",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Payment Due Alerts",
    description: "Automated reminder system with escalation rules",
    basic: "Basic",
    advanced: "Advanced",
    premium: "AI-powered"
  },
  {
    name: "Sales Team Performance Dashboard",
    description: "Comprehensive analytics and performance metrics",
    basic: false,
    advanced: true,
    premium: true
  },
  // System Features
  {
    name: "User Limit",
    description: "Maximum number of system users",
    basic: "10 users",
    advanced: "50 users",
    premium: "Unlimited"
  },
  {
    name: "Data Storage",
    description: "Database storage capacity",
    basic: "5 GB",
    advanced: "50 GB",
    premium: "Unlimited"
  },
  {
    name: "API Access",
    description: "Integration capabilities with third-party systems",
    basic: false,
    advanced: "Limited",
    premium: "Full API"
  },
  {
    name: "Custom Reports",
    description: "Generate custom business reports and analytics",
    basic: "Pre-built only",
    advanced: "Custom reports",
    premium: "Advanced BI"
  },
  {
    name: "Mobile App Access",
    description: "Mobile application for field operations",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Multi-branch Support",
    description: "Manage multiple business locations",
    basic: false,
    advanced: "Up to 5",
    premium: "Unlimited"
  },
  {
    name: "Data Export/Import",
    description: "Bulk data management capabilities",
    basic: "Basic CSV",
    advanced: "Multiple formats",
    premium: "Advanced tools"
  },
  {
    name: "Backup & Recovery",
    description: "Data backup and disaster recovery",
    basic: "Weekly",
    advanced: "Daily",
    premium: "Real-time"
  },
  // Support Features
  {
    name: "Email Support",
    description: "Email-based customer support",
    basic: true,
    advanced: true,
    premium: true
  },
  {
    name: "Phone Support",
    description: "Direct phone support access",
    basic: false,
    advanced: "Business hours",
    premium: "24/7"
  },
  {
    name: "Priority Support",
    description: "Faster response times and dedicated support",
    basic: false,
    advanced: true,
    premium: true
  },
  {
    name: "Training & Onboarding",
    description: "System training and implementation support",
    basic: "Self-service",
    advanced: "Guided setup",
    premium: "Full service"
  },
  {
    name: "SLA Guarantee",
    description: "Service level agreement with uptime guarantee",
    basic: false,
    advanced: "99.5%",
    premium: "99.9%"
  },
  {
    name: "Custom Integrations",
    description: "Custom integration development services",
    basic: false,
    advanced: false,
    premium: true
  },
  {
    name: "White-label Solution",
    description: "Branded solution with your company branding",
    basic: false,
    advanced: false,
    premium: true
  }
];

const plans = [
  {
    name: "Basic",
    price: "₹1,78,500",
    description: "Essential features for small businesses",
    recommended: false,
    color: "border-gray-200"
  },
  {
    name: "Advanced",
    price: "₹3,16,500",
    description: "Complete business management solution",
    recommended: true,
    color: "border-blue-500 ring-2 ring-blue-200"
  },
  {
    name: "Premium",
    price: "₹3,88,500",
    description: "Enterprise-grade with full customization",
    recommended: false,
    color: "border-gray-200"
  }
];

function FeatureIcon({ available, value }: { available: boolean | string; value?: string }) {
  if (typeof available === "string") {
    return <span className="text-sm font-medium text-gray-900">{available}</span>;
  }
  
  return available ? (
    <Check className="h-5 w-5 text-green-500" />
  ) : (
    <X className="h-5 w-5 text-gray-300" />
  );
}

export default function Pricing() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Select the perfect plan for your business management needs. All plans include core functionality with varying levels of advanced features.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, index) => (
          <Card key={plan.name} className={`relative ${plan.color} ${plan.recommended ? 'scale-105' : ''}`}>
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1 text-sm font-medium">
                  <Star className="h-4 w-4 mr-1" />
                  Recommended
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-gray-600 mb-4">
                {plan.description}
              </CardDescription>
              <div className="text-4xl font-bold text-gray-900">
                {plan.price}
                <span className="text-lg font-normal text-gray-600">/year</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <Button 
                className={`w-full mb-6 ${
                  plan.recommended 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                Get Started
              </Button>
              
              <ul className="space-y-3">
                {features.slice(0, 8).map((feature, featureIndex) => {
                  const value = plan.name === 'Basic' ? feature.basic : 
                               plan.name === 'Advanced' ? feature.advanced : 
                               feature.premium;
                  
                  return (
                    <li key={featureIndex} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{feature.name}</span>
                      <FeatureIcon available={value} />
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Feature Comparison Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Complete Feature Comparison
          </CardTitle>
          <CardDescription className="text-center">
            Compare all features across our pricing plans
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Features
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                          {plan.name}
                          {plan.recommended && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <div className="text-lg font-bold mt-1">{plan.price}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {features.map((feature, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                      {feature.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <FeatureIcon available={feature.basic} />
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50">
                      <FeatureIcon available={feature.advanced} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <FeatureIcon available={feature.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Frequently Asked Questions
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I upgrade my plan later?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Yes, you can upgrade your plan at any time. The price difference will be prorated for the remaining period.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a free trial available?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We offer a 30-day free trial for all plans. No credit card required to get started.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What support is included?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Basic plan includes email support. Advanced and Premium plans include priority support with faster response times.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}