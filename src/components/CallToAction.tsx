import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export const CallToAction = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <Card className="bg-gradient-primary border-0 shadow-glow">
          <CardContent className="p-12 text-center text-primary-foreground">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Ready to Revolutionize Your Crop Management?
              </h2>
              <p className="text-xl opacity-90 leading-relaxed">
                Join agricultural professionals worldwide who trust our AI-powered plant disease detection system. Start protecting your crops today with cutting-edge technology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/detection">
                  <Button variant="secondary" size="lg" className="shadow-elegant">
                    Access Model Now
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  View Documentation
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-8 text-sm opacity-80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span>Free to Try</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span>No Setup Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span>Instant Results</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};