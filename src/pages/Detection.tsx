import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Camera, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

const Detection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResults(null);
        setAnnotatedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data && data.predictions && data.predictions.length > 0) {
        const predictions = data.predictions;
        const diseaseDetected = predictions.some((pred: any) => 
          !pred.class_name.toLowerCase().includes('healthy') && 
          !pred.class_name.toLowerCase().includes('background')
        );
        
        const highestConfidence = Math.max(...predictions.map((p: any) => p.confidence));
        const topPrediction = predictions.find((p: any) => p.confidence === highestConfidence);
        
        setResults({
          disease: diseaseDetected ? topPrediction.class_name : "Healthy Plant",
          confidence: (highestConfidence * 100).toFixed(1),
          severity: diseaseDetected ? getSeverity(highestConfidence) : "None",
          treatment: diseaseDetected ? getTreatment(topPrediction.class_name) : "No treatment needed",
          description: diseaseDetected ? 
            `Detected ${topPrediction.class_name} with ${predictions.length} affected areas found.` : 
            "Plant appears healthy with no signs of disease.",
          isHealthy: !diseaseDetected,
          predictions: predictions
        });
        
        if (data.annotated_image) {
          setAnnotatedImage(data.annotated_image);
        }
      } else {
        setResults({
          disease: "Analysis Incomplete",
          confidence: 0,
          severity: "N/A",
          treatment: "Retry analysis",
          description: "Unable to detect clear patterns. Please try with a clearer image.",
          isHealthy: null,
          predictions: []
        });
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setResults({
        disease: "Connection Error",
        confidence: 0,
        severity: "N/A", 
        treatment: "Check connection",
        description: "Unable to connect to detection service. Please ensure the backend is running.",
        isHealthy: null,
        predictions: []
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile]);

  const getSeverity = (confidence: number) => {
    if (confidence > 0.8) return "High";
    if (confidence > 0.6) return "Moderate";
    return "Low";
  };

  const getTreatment = (disease: string) => {
    const treatments: { [key: string]: string } = {
      'blight': 'Apply copper-based fungicide and improve drainage',
      'rust': 'Use sulfur-based treatment and increase air circulation',
      'spot': 'Remove affected leaves and apply organic neem oil',
      'mildew': 'Increase air flow and apply baking soda solution',
      'wilt': 'Reduce watering and treat soil with beneficial bacteria'
    };
    
    const diseaseType = Object.keys(treatments).find(key => 
      disease.toLowerCase().includes(key)
    );
    
    return diseaseType ? treatments[diseaseType] : 'Consult plant pathologist for specific treatment';
  };

  const handleChangeImage = useCallback(() => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResults(null);
    setAnnotatedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, []);




  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0]) {
      setSelectedFile(files[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setResults(null);
        setAnnotatedImage(null);
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
                      ref={fileInputRef}
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
                        id="uploaded-image"
                      />
                      {results && results.predictions && results.predictions.length > 0 && (
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          {results.predictions.map((pred: any, index: number) => (
                            !pred.class_name.toLowerCase().includes('healthy') && 
                            !pred.class_name.toLowerCase().includes('background') && (
                              <g key={index}>
                                <rect
                                  x={pred.x1 || pred.bbox?.[0] || 0}
                                  y={pred.y1 || pred.bbox?.[1] || 0}
                                  width={(pred.x2 || pred.bbox?.[2] || 0) - (pred.x1 || pred.bbox?.[0] || 0)}
                                  height={(pred.y2 || pred.bbox?.[3] || 0) - (pred.y1 || pred.bbox?.[1] || 0)}
                                  fill="none"
                                  stroke="hsl(var(--destructive))"
                                  strokeWidth="0.5"
                                  strokeDasharray="2,2"
                                  className="animate-pulse"
                                />
                                <text
                                  x={pred.x1 || pred.bbox?.[0] || 0}
                                  y={(pred.y1 || pred.bbox?.[1] || 0) - 1}
                                  fill="hsl(var(--destructive))"
                                  fontSize="2"
                                  className="font-medium"
                                >
                                  {pred.class_name} ({(pred.confidence * 100).toFixed(0)}%)
                                </text>
                              </g>
                            )
                          ))}
                        </svg>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleChangeImage}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
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
                  {results?.isHealthy ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  )}
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
                        <Badge variant={results.isHealthy ? "default" : results.confidence > 70 ? "destructive" : "secondary"}>
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

          {/* Infected Areas Visualization */}
          {annotatedImage && (
            <Card className="mt-8 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Detected Problem Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    The highlighted areas show where disease symptoms were detected by the AI model.
                  </p>
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={annotatedImage}
                      alt="Annotated plant with detected areas"
                      className="w-full h-auto"
                    />
                  </div>
                  {results?.predictions && results.predictions.length > 1 && (
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Found {results.predictions.length} areas of concern</strong></p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {results.predictions.slice(0, 3).map((pred: any, index: number) => (
                          <li key={index}>
                            {pred.class_name} - {(pred.confidence * 100).toFixed(1)}% confidence
                          </li>
                        ))}
                        {results.predictions.length > 3 && (
                          <li>...and {results.predictions.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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