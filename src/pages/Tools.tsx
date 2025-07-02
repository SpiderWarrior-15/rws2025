import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Square, Heart, Ruler, Weight, DollarSign, Thermometer, Clock } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  category: string;
}

export const Tools: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string>('calculator');
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [calculatorPrevious, setCalculatorPrevious] = useState<string | null>(null);
  const [calculatorOperation, setCalculatorOperation] = useState<string | null>(null);
  const [calculatorWaitingForOperand, setCalculatorWaitingForOperand] = useState(false);

  // BMI Calculator
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<number | null>(null);

  // Area Calculator
  const [areaLength, setAreaLength] = useState('');
  const [areaWidth, setAreaWidth] = useState('');
  const [areaResult, setAreaResult] = useState<number | null>(null);

  // Perimeter Calculator
  const [perimeterLength, setPerimeterLength] = useState('');
  const [perimeterWidth, setPerimeterWidth] = useState('');
  const [perimeterResult, setPerimeterResult] = useState<number | null>(null);

  // Currency Converter (simplified)
  const [currencyAmount, setCurrencyAmount] = useState('');
  const [currencyFrom, setCurrencyFrom] = useState('USD');
  const [currencyTo, setCurrencyTo] = useState('EUR');
  const [currencyResult, setCurrencyResult] = useState<number | null>(null);

  // Temperature Converter
  const [tempValue, setTempValue] = useState('');
  const [tempFrom, setTempFrom] = useState('celsius');
  const [tempTo, setTempTo] = useState('fahrenheit');
  const [tempResult, setTempResult] = useState<number | null>(null);

  const tools: Tool[] = [
    {
      id: 'calculator',
      name: 'Calculator',
      description: 'Basic arithmetic calculator',
      icon: Calculator,
      category: 'Math'
    },
    {
      id: 'bmi',
      name: 'BMI Calculator',
      description: 'Calculate your Body Mass Index',
      icon: Heart,
      category: 'Health'
    },
    {
      id: 'area',
      name: 'Area Calculator',
      description: 'Calculate area of rectangles',
      icon: Square,
      category: 'Geometry'
    },
    {
      id: 'perimeter',
      name: 'Perimeter Calculator',
      description: 'Calculate perimeter of rectangles',
      icon: Ruler,
      category: 'Geometry'
    },
    {
      id: 'currency',
      name: 'Currency Converter',
      description: 'Convert between currencies',
      icon: DollarSign,
      category: 'Finance'
    },
    {
      id: 'temperature',
      name: 'Temperature Converter',
      description: 'Convert between temperature units',
      icon: Thermometer,
      category: 'Science'
    }
  ];

  // Calculator functions
  const inputDigit = (digit: string) => {
    if (calculatorWaitingForOperand) {
      setCalculatorDisplay(digit);
      setCalculatorWaitingForOperand(false);
    } else {
      setCalculatorDisplay(calculatorDisplay === '0' ? digit : calculatorDisplay + digit);
    }
  };

  const inputDecimal = () => {
    if (calculatorWaitingForOperand) {
      setCalculatorDisplay('0.');
      setCalculatorWaitingForOperand(false);
    } else if (calculatorDisplay.indexOf('.') === -1) {
      setCalculatorDisplay(calculatorDisplay + '.');
    }
  };

  const clear = () => {
    setCalculatorDisplay('0');
    setCalculatorPrevious(null);
    setCalculatorOperation(null);
    setCalculatorWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(calculatorDisplay);

    if (calculatorPrevious === null) {
      setCalculatorPrevious(calculatorDisplay);
    } else if (calculatorOperation) {
      const currentValue = calculatorPrevious || '0';
      const newValue = calculate(parseFloat(currentValue), inputValue, calculatorOperation);

      setCalculatorDisplay(String(newValue));
      setCalculatorPrevious(String(newValue));
    }

    setCalculatorWaitingForOperand(true);
    setCalculatorOperation(nextOperation);
  };

  const calculate = (firstOperand: number, secondOperand: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '*':
        return firstOperand * secondOperand;
      case '/':
        return firstOperand / secondOperand;
      case '=':
        return secondOperand;
      default:
        return secondOperand;
    }
  };

  const handleCalculatorOperation = (operation: string) => {
    if (operation === '=') {
      const inputValue = parseFloat(calculatorDisplay);
      if (calculatorPrevious !== null && calculatorOperation) {
        const newValue = calculate(parseFloat(calculatorPrevious), inputValue, calculatorOperation);
        setCalculatorDisplay(String(newValue));
        setCalculatorPrevious(null);
        setCalculatorOperation(null);
        setCalculatorWaitingForOperand(true);
      }
    } else {
      performOperation(operation);
    }
  };

  // BMI Calculator
  const calculateBMI = () => {
    const height = parseFloat(bmiHeight) / 100; // Convert cm to m
    const weight = parseFloat(bmiWeight);
    if (height > 0 && weight > 0) {
      const bmi = weight / (height * height);
      setBmiResult(Math.round(bmi * 10) / 10);
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-400' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-400' };
    return { category: 'Obese', color: 'text-red-400' };
  };

  // Area Calculator
  const calculateArea = () => {
    const length = parseFloat(areaLength);
    const width = parseFloat(areaWidth);
    if (length > 0 && width > 0) {
      setAreaResult(length * width);
    }
  };

  // Perimeter Calculator
  const calculatePerimeter = () => {
    const length = parseFloat(perimeterLength);
    const width = parseFloat(perimeterWidth);
    if (length > 0 && width > 0) {
      setPerimeterResult(2 * (length + width));
    }
  };

  // Currency Converter (simplified rates)
  const convertCurrency = () => {
    const amount = parseFloat(currencyAmount);
    if (amount > 0) {
      // Simplified conversion rates (in real app, use API)
      const rates: Record<string, Record<string, number>> = {
        USD: { EUR: 0.85, GBP: 0.73, JPY: 110 },
        EUR: { USD: 1.18, GBP: 0.86, JPY: 129 },
        GBP: { USD: 1.37, EUR: 1.16, JPY: 150 },
        JPY: { USD: 0.009, EUR: 0.008, GBP: 0.007 }
      };
      
      if (currencyFrom === currencyTo) {
        setCurrencyResult(amount);
      } else {
        const rate = rates[currencyFrom]?.[currencyTo] || 1;
        setCurrencyResult(Math.round(amount * rate * 100) / 100);
      }
    }
  };

  // Temperature Converter
  const convertTemperature = () => {
    const value = parseFloat(tempValue);
    if (!isNaN(value)) {
      let result = value;
      
      if (tempFrom === 'celsius' && tempTo === 'fahrenheit') {
        result = (value * 9/5) + 32;
      } else if (tempFrom === 'fahrenheit' && tempTo === 'celsius') {
        result = (value - 32) * 5/9;
      } else if (tempFrom === 'celsius' && tempTo === 'kelvin') {
        result = value + 273.15;
      } else if (tempFrom === 'kelvin' && tempTo === 'celsius') {
        result = value - 273.15;
      } else if (tempFrom === 'fahrenheit' && tempTo === 'kelvin') {
        result = (value - 32) * 5/9 + 273.15;
      } else if (tempFrom === 'kelvin' && tempTo === 'fahrenheit') {
        result = (value - 273.15) * 9/5 + 32;
      }
      
      setTempResult(Math.round(result * 100) / 100);
    }
  };

  const renderTool = () => {
    switch (activeToolId) {
      case 'calculator':
        return (
          <div className="max-w-sm mx-auto">
            <div className="bg-black/20 p-4 rounded-lg mb-4">
              <div className="text-right text-2xl font-mono text-white bg-black/50 p-4 rounded">
                {calculatorDisplay}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={clear} className="col-span-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 p-4 rounded-lg font-bold">
                Clear
              </button>
              <button onClick={() => handleCalculatorOperation('/')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-4 rounded-lg font-bold">
                ÷
              </button>
              <button onClick={() => handleCalculatorOperation('*')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-4 rounded-lg font-bold">
                ×
              </button>
              
              {[7, 8, 9].map(num => (
                <button key={num} onClick={() => inputDigit(String(num))} className="bg-gray-500/20 hover:bg-gray-500/30 text-white p-4 rounded-lg font-bold">
                  {num}
                </button>
              ))}
              <button onClick={() => handleCalculatorOperation('-')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-4 rounded-lg font-bold">
                −
              </button>
              
              {[4, 5, 6].map(num => (
                <button key={num} onClick={() => inputDigit(String(num))} className="bg-gray-500/20 hover:bg-gray-500/30 text-white p-4 rounded-lg font-bold">
                  {num}
                </button>
              ))}
              <button onClick={() => handleCalculatorOperation('+')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-4 rounded-lg font-bold">
                +
              </button>
              
              {[1, 2, 3].map(num => (
                <button key={num} onClick={() => inputDigit(String(num))} className="bg-gray-500/20 hover:bg-gray-500/30 text-white p-4 rounded-lg font-bold">
                  {num}
                </button>
              ))}
              <button onClick={() => handleCalculatorOperation('=')} className="row-span-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 p-4 rounded-lg font-bold">
                =
              </button>
              
              <button onClick={() => inputDigit('0')} className="col-span-2 bg-gray-500/20 hover:bg-gray-500/30 text-white p-4 rounded-lg font-bold">
                0
              </button>
              <button onClick={inputDecimal} className="bg-gray-500/20 hover:bg-gray-500/30 text-white p-4 rounded-lg font-bold">
                .
              </button>
            </div>
          </div>
        );

      case 'bmi':
        return (
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={bmiHeight}
                onChange={(e) => setBmiHeight(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                placeholder="Enter height in cm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={bmiWeight}
                onChange={(e) => setBmiWeight(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                placeholder="Enter weight in kg"
              />
            </div>
            <AnimatedButton variant="primary" onClick={calculateBMI} className="w-full">
              Calculate BMI
            </AnimatedButton>
            {bmiResult && (
              <div className="text-center p-4 bg-white/10 dark:bg-gray-800/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  BMI: {bmiResult}
                </div>
                <div className={`text-lg font-medium ${getBMICategory(bmiResult).color}`}>
                  {getBMICategory(bmiResult).category}
                </div>
              </div>
            )}
          </div>
        );

      case 'area':
        return (
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Length
              </label>
              <input
                type="number"
                value={areaLength}
                onChange={(e) => setAreaLength(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                placeholder="Enter length"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Width
              </label>
              <input
                type="number"
                value={areaWidth}
                onChange={(e) => setAreaWidth(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                placeholder="Enter width"
              />
            </div>
            <AnimatedButton variant="primary" onClick={calculateArea} className="w-full">
              Calculate Area
            </AnimatedButton>
            {areaResult && (
              <div className="text-center p-4 bg-white/10 dark:bg-gray-800/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  Area: {areaResult} square units
                </div>
              </div>
            )}
          </div>
        );

      case 'perimeter':
        return (
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Length
              </label>
              <input
                type="number"
                value={perimeterLength}
                onChange={(e) => setPerimeterLength(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                placeholder="Enter length"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Width
              </label>
              <input
                type="number"
                value={perimeterWidth}
                onChange={(e) => setPerimeterWidth(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                placeholder="Enter width"
              />
            </div>
            <AnimatedButton variant="primary" onClick={calculatePerimeter} className="w-full">
              Calculate Perimeter
            </AnimatedButton>
            {perimeterResult && (
              <div className="text-center p-4 bg-white/10 dark:bg-gray-800/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  Perimeter: {perimeterResult} units
                </div>
              </div>
            )}
          </div>
        );

      case 'currency':
        return (
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={currencyAmount}
                onChange={(e) => setCurrencyAmount(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                placeholder="Enter amount"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From
                </label>
                <select
                  value={currencyFrom}
                  onChange={(e) => setCurrencyFrom(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To
                </label>
                <select
                  value={currencyTo}
                  onChange={(e) => setCurrencyTo(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>
            <AnimatedButton variant="primary" onClick={convertCurrency} className="w-full">
              Convert Currency
            </AnimatedButton>
            {currencyResult && (
              <div className="text-center p-4 bg-white/10 dark:bg-gray-800/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {currencyResult} {currencyTo}
                </div>
              </div>
            )}
          </div>
        );

      case 'temperature':
        return (
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature
              </label>
              <input
                type="number"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                placeholder="Enter temperature"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From
                </label>
                <select
                  value={tempFrom}
                  onChange={(e) => setTempFrom(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                >
                  <option value="celsius">Celsius</option>
                  <option value="fahrenheit">Fahrenheit</option>
                  <option value="kelvin">Kelvin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To
                </label>
                <select
                  value={tempTo}
                  onChange={(e) => setTempTo(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                >
                  <option value="celsius">Celsius</option>
                  <option value="fahrenheit">Fahrenheit</option>
                  <option value="kelvin">Kelvin</option>
                </select>
              </div>
            </div>
            <AnimatedButton variant="primary" onClick={convertTemperature} className="w-full">
              Convert Temperature
            </AnimatedButton>
            {tempResult !== null && (
              <div className="text-center p-4 bg-white/10 dark:bg-gray-800/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {tempResult}° {tempTo.charAt(0).toUpperCase() + tempTo.slice(1)}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const activeTool = tools.find(tool => tool.id === activeToolId);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-md border border-green-500/30 mb-6">
            <Calculator className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-400">Utility Tools</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Warrior Tools
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Essential tools and calculators for everyday use
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Tool Selection */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Available Tools</h3>
              <div className="space-y-2">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveToolId(tool.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                        activeToolId === tool.id
                          ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
                          : 'hover:bg-white/10 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-xs opacity-75">{tool.category}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Tool Interface */}
          <div className="lg:col-span-3">
            <GlassCard className="p-8">
              {activeTool && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <activeTool.icon className="w-8 h-8 text-green-500" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {activeTool.name}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {activeTool.description}
                  </p>
                </div>
              )}
              
              <div className="min-h-[400px] flex items-center justify-center">
                {renderTool()}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};