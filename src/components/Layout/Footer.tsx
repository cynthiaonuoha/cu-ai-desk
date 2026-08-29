
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-gradient-to-r from-purple-700 to-purple-800 text-white py-8 mt-16"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <motion.img 
              src="/lovable-uploads/d7726cc8-b266-4fe1-b563-dbfcbbbf7e9c.png" 
              alt="Covenant University Logo" 
              className="h-8 w-8 rounded-full"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            />
            <div>
              <h3 className="font-bold font-playfair">CU AI Desk</h3>
              <p className="text-sm text-purple-200">For Covenant University</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-purple-200">
            <span className="text-sm">Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-red-400 fill-current" />
            </motion.div>
            <span className="text-sm">for Covenant Students</span>
          </div>
        </div>
        
        <div className="border-t border-purple-600 mt-6 pt-6 text-center">
          <p className="text-sm text-purple-200">
            © 2025 CU AI Desk. Empowering academic excellence and personal growth.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
