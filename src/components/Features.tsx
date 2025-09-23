import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: "🎯",
    title: "YOLO Object Detection",
    description: "State-of-the-art You Only Look Once algorithm for real-time plant disease identification with exceptional speed and accuracy."
  },
  {
    icon: "🧠",
    title: "Google Colab Trained",
    description: "Model trained using powerful cloud computing resources, ensuring robust performance across diverse plant types and conditions."
  },
  {
    icon: "⚡",
    title: "Instant Results",
    description: "Get disease classification results in under 0.3 seconds, enabling rapid decision-making for crop management."
  },
  {
    icon: "📊",
    title: "High Accuracy",
    description: "Achieve 99.2% accuracy in disease detection across multiple plant species with continuous model improvements."
  },
  {
    icon: "🌱",
    title: "Multi-Plant Support",
    description: "Supports detection across various crops including tomatoes, potatoes, corn, and other agricultural plants."
  },
  {
    icon: "📱",
    title: "Easy Integration",
    description: "Simple API endpoints and user-friendly interface make integration into existing agricultural workflows seamless."
  }
];

export const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Advanced AI Technology
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Leveraging cutting-edge computer vision and machine learning to revolutionize plant health monitoring.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-border hover:shadow-elegant transition-all duration-300 group">
              <CardHeader>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};