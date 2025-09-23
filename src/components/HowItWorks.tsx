import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Upload Image",
    description: "Simply upload a photo of the plant leaf you want to analyze. Our system accepts various image formats.",
    icon: "📸"
  },
  {
    number: "02", 
    title: "AI Processing",
    description: "Our YOLO-based model processes the image using advanced computer vision algorithms trained on thousands of samples.",
    icon: "🤖"
  },
  {
    number: "03",
    title: "Disease Detection",
    description: "The AI identifies potential diseases, highlighting affected areas with bounding boxes and confidence scores.",
    icon: "🔍"
  },
  {
    number: "04",
    title: "Get Results",
    description: "Receive detailed analysis including disease type, severity level, and recommended treatment options.",
    icon: "📋"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            🔬 How It Works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple 4-Step Process
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From image upload to actionable insights in seconds. Our streamlined process makes plant disease detection accessible to everyone.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20 z-0"></div>
              )}
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-2xl text-primary-foreground mx-auto mb-6 shadow-glow">
                  {step.icon}
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm font-bold text-primary">STEP {step.number}</div>
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button size="lg" className="shadow-elegant">
            Try Live Demo
          </Button>
        </div>
      </div>
    </section>
  );
};