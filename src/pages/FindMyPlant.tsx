import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, ArrowLeft, Leaf, Sun, Wind, Droplets, Map, Sparkles, ShoppingCart, Home as HomeIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { chatWithBloom } from '../services/aiService';
import { productService } from '../services/productService';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
  {
    id: 'environment',
    text: "Where will your plant live?",
    options: [
      { label: 'Indoor', icon: HomeIcon, value: 'indoor' },
      { label: 'Outdoor', icon: Map, value: 'outdoor' },
      { label: 'Balcony', icon: Wind, value: 'balcony' }
    ]
  },
  {
    id: 'sunlight',
    text: "How much sunlight does the spot get?",
    options: [
      { label: 'Direct Sun', icon: Sun, value: 'high' },
      { label: 'Partial Shade', icon: Sun, value: 'medium' },
      { label: 'Low Light', icon: Leaf, value: 'low' }
    ]
  },
  {
    id: 'experience',
    text: "How would you describe your plant parenting skills?",
    options: [
      { label: 'Beginner', value: 'easy' },
      { label: 'Intermediate', value: 'medium' },
      { label: 'Expert', value: 'advanced' }
    ]
  }
];

export const FindMyPlant = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAnswer = (value: string) => {
    const currentQuestion = QUESTIONS[step];
    setAnswers({ ...answers, [currentQuestion.id]: value });
    
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      analyzeResults({ ...answers, [currentQuestion.id]: value });
    }
  };

  const analyzeResults = async (finalAnswers: Record<string, string>) => {
    setIsAnalyzing(true);
    setStep(QUESTIONS.length);

    try {
      const prompt = `Based on these preferences: Environment: ${finalAnswers.environment}, Sunlight: ${finalAnswers.sunlight}, Experience: ${finalAnswers.experience}. 
      Give me a friendly 2-sentence expert recommendation for the type of plants that would suit them. 
      Then, recommend 3 specific plant names.`;
      
      const response = await chatWithBloom(prompt);
      setAiAnalysis(response);

      // Simple keyword matching for demo recommendations
      const allProducts = await new Promise<Product[]>((resolve) => productService.subscribeToProducts(resolve));
      const filtered = allProducts
        .filter(p => p.sunlight?.toLowerCase() === finalAnswers.sunlight.toLowerCase() || p.category.toLowerCase().includes(finalAnswers.environment))
        .slice(0, 3);
      
      setRecommendations(filtered);
    } catch (error) {
      console.error('AI Matcher Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <AnimatePresence mode="wait">
        {step < QUESTIONS.length ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>AI Recommendation Engine</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">{QUESTIONS[step].text}</h1>
              <p className="text-gray-500">Step {step + 1} of {QUESTIONS.length}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {QUESTIONS[step].options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="group relative p-6 rounded-3xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 transition-all text-left flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    {option.icon && (
                      <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-white text-gray-400 group-hover:text-green-600 transition-colors">
                        <option.icon className="w-6 h-6" />
                      </div>
                    )}
                    <span className="text-xl font-bold text-gray-700 group-hover:text-green-900">{option.label}</span>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-200 group-hover:text-green-500 transform group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex items-center text-gray-400 hover:text-green-600 transition-colors font-bold text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous Question
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {isAnalyzing ? (
              <div className="text-center py-20 space-y-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto" />
                  <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-600 w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 italic">"Bloom is analyzing your space..."</h2>
                <div className="flex justify-center flex-wrap gap-2 max-w-xs mx-auto">
                  {['Checking Sunlight', 'Measuring Humidty', 'Assessing Experience'].map(tag => (
                    <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 animate-pulse">{tag}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <header className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-green-600" />
                  </div>
                  <h1 className="text-3xl font-bold">Your Perfect Green Match!</h1>
                  <div className="bg-white p-6 rounded-3xl border border-green-100 shadow-sm text-gray-600 italic leading-relaxed relative">
                     <Sparkles className="absolute -top-3 -left-3 text-amber-400 w-8 h-8" />
                     {aiAnalysis}
                  </div>
                </header>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">Recommended for You</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {recommendations.map((product) => (
                      <Card key={product.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-24 h-24 rounded-2xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate group-hover:text-green-600 transition-colors">{product.name}</h4>
                          <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-green-700">₹{product.price}</span>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/product/${product.id}`)}
                                className="h-8 text-xs font-bold rounded-full"
                              >
                                View
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => addToCart(product, 1)}
                                className="h-8 text-xs font-bold rounded-full"
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => {
                    setStep(0);
                    setAnswers({});
                  }}>
                    Retake Quiz
                  </Button>
                  <Button className="flex-1 rounded-2xl" onClick={() => navigate('/explore')}>
                    Explore All
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
