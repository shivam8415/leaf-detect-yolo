import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Camera, CheckCircle, AlertCircle } from "lucide-react";

const Detection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock results
    setResults({
      disease: "Tomato Late Blight",
      confidence: 94.7,
      severity: "Moderate",
      treatment: "Apply copper-based fungicide",
      description: "Late blight is a serious disease affecting tomatoes. Early intervention is crucial."
    });
    
    setIsAnalyzing(false);
  }, [selectedImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setResults(null);
      };
      reader.readAsDataURL(files[0]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Plant Disease Detection</h1>
              <p className="text-sm text-muted-foreground">Upload an image to analyze</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Image Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedImage ? (
                  <div
                    className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Drop your plant image here
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <Badge variant="secondary">
                      Supports: JPG, PNG, WEBP
                    </Badge>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={selectedImage}
                        alt="Selected plant"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => document.getElementById('image-upload')?.click()}
                        variant="outline"
                        size="sm"
                      >
                        Change Image
                      </Button>
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="flex-1"
                      >
                        {isAnalyzing ? "Analyzing..." : "Analyze Disease"}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Tips for best results:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Use clear, well-lit images</li>
                    <li>Focus on diseased leaf areas</li>
                    <li>Avoid blurry or dark photos</li>
                    <li>Single leaf works better than whole plant</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Detection Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedImage ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Upload an image to see detection results</p>
                  </div>
                ) : isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-foreground font-medium">Analyzing image...</p>
                    <p className="text-sm text-muted-foreground">AI model is processing your image</p>
                  </div>
                ) : results ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">
                          {results.disease}
                        </h3>
                        <Badge variant={results.confidence > 90 ? "default" : "secondary"}>
                          {results.confidence}% confidence
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">Severity</p>
                          <p className="text-sm text-muted-foreground">{results.severity}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">Recommended Action</p>
                          <p className="text-sm text-muted-foreground">{results.treatment}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Description</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {results.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Save Report
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Share Results
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Analyze Disease" to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <Card className="mt-8 shadow-elegant">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Disease Types</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">99.2%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">0.3s</div>
                  <div className="text-sm text-muted-foreground">Detection Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">5000+</div>
                  <div className="text-sm text-muted-foreground">Images Analyzed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Detection;