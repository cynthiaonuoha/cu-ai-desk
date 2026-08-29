
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Delete, Divide, Minus, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

const CalculatorPage = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = currentValue / inputValue;
          break;
        default:
          return;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const currentValue = previousValue;
      let result;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = currentValue / inputValue;
          break;
        default:
          return;
      }

      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const ButtonComponent = ({ 
    onClick, 
    className = "", 
    children, 
    variant = "default" 
  }: { 
    onClick: () => void; 
    className?: string; 
    children: React.ReactNode;
    variant?: "default" | "operation" | "equals" | "clear";
  }) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "operation":
          return "bg-blue-600 hover:bg-blue-700 text-white";
        case "equals":
          return "bg-green-600 hover:bg-green-700 text-white";
        case "clear":
          return "bg-red-600 hover:bg-red-700 text-white";
        default:
          return "bg-gray-200 hover:bg-gray-300 text-gray-800";
      }
    };

    return (
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onClick}
          className={`h-16 text-xl font-semibold ${getVariantStyles()} ${className}`}
        >
          {children}
        </Button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-blue-800 mb-2 font-serif"
          >
            🧮 Calculator
          </motion.h1>
          <p className="text-blue-600">Quick calculations for your studies</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-2xl border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-2 justify-center">
                <Calculator size={24} />
                Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Display */}
              <div className="mb-6">
                <div className="bg-gray-100 border-2 border-gray-200 rounded-lg p-4 text-right">
                  <div className="text-3xl font-mono font-bold text-gray-800 overflow-hidden">
                    {display}
                  </div>
                </div>
              </div>

              {/* Button Grid */}
              <div className="grid grid-cols-4 gap-3">
                {/* Row 1 */}
                <ButtonComponent onClick={clear} variant="clear" className="col-span-2">
                  Clear
                </ButtonComponent>
                <ButtonComponent onClick={() => setDisplay(display.slice(0, -1) || '0')}>
                  <Delete size={20} />
                </ButtonComponent>
                <ButtonComponent onClick={() => performOperation('÷')} variant="operation">
                  <Divide size={20} />
                </ButtonComponent>

                {/* Row 2 */}
                <ButtonComponent onClick={() => inputNumber('7')}>7</ButtonComponent>
                <ButtonComponent onClick={() => inputNumber('8')}>8</ButtonComponent>
                <ButtonComponent onClick={() => inputNumber('9')}>9</ButtonComponent>
                <ButtonComponent onClick={() => performOperation('×')} variant="operation">
                  <X size={20} />
                </ButtonComponent>

                {/* Row 3 */}
                <ButtonComponent onClick={() => inputNumber('4')}>4</ButtonComponent>
                <ButtonComponent onClick={() => inputNumber('5')}>5</ButtonComponent>
                <ButtonComponent onClick={() => inputNumber('6')}>6</ButtonComponent>
                <ButtonComponent onClick={() => performOperation('-')} variant="operation">
                  <Minus size={20} />
                </ButtonComponent>

                {/* Row 4 */}
                <ButtonComponent onClick={() => inputNumber('1')}>1</ButtonComponent>
                <ButtonComponent onClick={() => inputNumber('2')}>2</ButtonComponent>
                <ButtonComponent onClick={() => inputNumber('3')}>3</ButtonComponent>
                <ButtonComponent onClick={() => performOperation('+')} variant="operation">
                  <Plus size={20} />
                </ButtonComponent>

                {/* Row 5 */}
                <ButtonComponent onClick={() => inputNumber('0')} className="col-span-2">
                  0
                </ButtonComponent>
                <ButtonComponent onClick={inputDecimal}>.</ButtonComponent>
                <ButtonComponent onClick={calculate} variant="equals">
                  =
                </ButtonComponent>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CalculatorPage;
