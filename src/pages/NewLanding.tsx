import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollAnimationWrapper from "../components/ScrollAnimationWrapper";
import ThreeDCard from "../components/ThreeDCard";
import TypewriterText from "../components/TypewriterText";
import ParticleBackground from "../components/ParticleBackground";
import AnimatedIcon from "../components/AnimatedIcon";

export default function NewLanding() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [stats, setStats] = useState({
        colleges: 0,
        students: 0,
        accuracy: 0,
        predictions: 0
    });

    // Animated counters
    useEffect(() => {
        const targetStats = {
            colleges: 340,
            students: 52843,
            accuracy: 95.7,
            predictions: 150000
        };

        const duration = 2000;
        const steps = 60;

        const animateCounters = () => {
            const increment = {
                colleges: targetStats.colleges / steps,
                students: targetStats.students / steps,
                accuracy: targetStats.accuracy / steps,
                predictions: targetStats.predictions / steps
            };

            let currentStats = { colleges: 0, students: 0, accuracy: 0, predictions: 0 };
            let step = 0;

            const timer = setInterval(() => {
                step++;
                currentStats.colleges = Math.min(Math.floor(increment.colleges * step), targetStats.colleges);
                currentStats.students = Math.min(Math.floor(increment.students * step), targetStats.students);
                currentStats.accuracy = parseFloat(Math.min(increment.accuracy * step, targetStats.accuracy).toFixed(1));
                currentStats.predictions = Math.min(Math.floor(increment.predictions * step), targetStats.predictions);

                setStats({ ...currentStats });

                if (step >= steps) clearInterval(timer);
            }, duration / steps);
        };

        animateCounters();
    }, []);

    const journeySteps = [
        {
            title: "Enter Your Details",
            description: "Share your exam scores, rank, and preferences",
            icon: "student" as const,
        },
        {
            title: "AI Analysis",
            description: "Our AI analyzes 340+ colleges and thousands of data points",
            icon: "brain" as const,
        },
        {
            title: "Get Predictions",
            description: "Receive personalized college recommendations with admission chances",
            icon: "chart" as const,
        },
        {
            title: "Make Your Choice",
            description: "Compare colleges and make an informed decision",
            icon: "trophy" as const,
        },
    ];

    const features = [
        {
            title: "AI-Powered Predictions",
            description: "Advanced machine learning algorithms analyze your profile and predict admission chances with 95.7% accuracy",
            icon: "brain" as const,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            title: "Comprehensive Database",
            description: "Access detailed information about 340+ engineering colleges across India with real-time data",
            icon: "college" as const,
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            title: "Interactive Analytics",
            description: "Visualize admission trends, cutoff patterns, and placement statistics with beautiful charts",
            icon: "chart" as const,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            title: "Smart Comparison",
            description: "Compare colleges side-by-side with detailed metrics and make data-driven decisions",
            icon: "target" as const,
            gradient: "from-orange-500 to-red-500",
        },
    ];

    const testimonials = [
        {
            name: "Rahul Sharma",
            college: "Computer Engineering, Mumbai University",
            quote: "The AI predictions were spot-on! I got into my dream college thanks to SmartCF.",
            score: 95,
            initials: "RS",
        },
        {
            name: "Priya Patel",
            college: "Mechanical Engineering, Delhi University",
            quote: "Beautiful interface and incredibly accurate predictions. Highly recommended!",
            score: 92,
            initials: "PP",
        },
        {
            name: "Amit Kumar",
            college: "Electrical Engineering, Pune University",
            quote: "The comparison feature helped me make the right choice. Thank you SmartCF!",
            score: 97,
            initials: "AK",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 overflow-hidden">
            {/* Navigation */}
            <nav className="fixed w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <motion.div
                                className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="text-white font-bold text-xl">S</div>
                            </motion.div>
                            <div>
                                <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    SmartCF
                                </div>
                                <div className="text-xs text-gray-500">AI College Finder</div>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <button className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                Features
                            </button>
                            <button className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                How It Works
                            </button>
                            <button className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                Testimonials
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate("/login")}
                                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                            >
                                Login
                            </button>
                            <motion.button
                                onClick={() => navigate("/signup")}
                                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Get Started
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - The Dream */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <ParticleBackground particleCount={40} particleColor="99, 102, 241" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center">
                        <ScrollAnimationWrapper animation="fade" duration={0.8}>
                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full mb-6 border border-indigo-100">
                                <motion.div
                                    className="w-2 h-2 bg-indigo-500 rounded-full mr-2"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span className="text-sm font-medium text-indigo-600">AI-Powered College Predictions</span>
                            </div>
                        </ScrollAnimationWrapper>

                        <ScrollAnimationWrapper animation="slideUp" delay={0.2}>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                                <span className="block text-gray-900">Find Your</span>
                                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                                    <TypewriterText
                                        texts={["Dream College", "Perfect Match", "Future Success"]}
                                        speed={150}
                                        delayBetween={2000}
                                    />
                                </span>
                            </h1>
                        </ScrollAnimationWrapper>

                        <ScrollAnimationWrapper animation="slideUp" delay={0.4}>
                            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                                Let AI guide you to the perfect engineering college with{" "}
                                <span className="font-bold text-indigo-600">95.7% accuracy</span> predictions
                            </p>
                        </ScrollAnimationWrapper>

                        <ScrollAnimationWrapper animation="scale" delay={0.6}>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <motion.button
                                    onClick={() => navigate("/signup")}
                                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Start Your Journey
                                        <AnimatedIcon type="rocket" size={24} animate={false} />
                                    </span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: '100%' }}
                                        transition={{ duration: 0.6 }}
                                    />
                                </motion.button>

                                <motion.button
                                    onClick={() => navigate("/college-explorer")}
                                    className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:border-indigo-500 hover:text-indigo-600 transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Explore Colleges
                                </motion.button>
                            </div>
                        </ScrollAnimationWrapper>

                        {/* Floating Icons */}
                        <div className="relative mt-16 h-64">
                            <motion.div
                                className="absolute left-1/4 top-0"
                                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <AnimatedIcon type="college" size={80} />
                            </motion.div>
                            <motion.div
                                className="absolute right-1/4 top-10"
                                animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                            >
                                <AnimatedIcon type="brain" size={70} />
                            </motion.div>
                            <motion.div
                                className="absolute left-1/3 bottom-0"
                                animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                            >
                                <AnimatedIcon type="chart" size={60} />
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm text-gray-500">Scroll to explore</span>
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <ScrollAnimationWrapper animation="fade">
                <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2%, transparent 2%)`,
                            backgroundSize: '50px 50px'
                        }} />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <motion.div
                                    className="text-4xl md:text-5xl font-bold text-white mb-2"
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                >
                                    {stats.colleges}+
                                </motion.div>
                                <div className="text-white/90 font-medium">Engineering Colleges</div>
                            </div>

                            <div className="text-center">
                                <motion.div
                                    className="text-4xl md:text-5xl font-bold text-white mb-2"
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                                >
                                    {stats.students.toLocaleString()}+
                                </motion.div>
                                <div className="text-white/90 font-medium">Students Helped</div>
                            </div>

                            <div className="text-center">
                                <motion.div
                                    className="text-4xl md:text-5xl font-bold text-white mb-2"
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                                >
                                    {stats.accuracy}%
                                </motion.div>
                                <div className="text-white/90 font-medium">Prediction Accuracy</div>
                            </div>

                            <div className="text-center">
                                <motion.div
                                    className="text-4xl md:text-5xl font-bold text-white mb-2"
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
                                >
                                    {stats.predictions.toLocaleString()}+
                                </motion.div>
                                <div className="text-white/90 font-medium">Predictions Made</div>
                            </div>
                        </div>
                    </div>
                </section>
            </ScrollAnimationWrapper>

            {/* The Problem Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <ScrollAnimationWrapper animation="slideUp">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                The Challenge
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Finding the right engineering college is overwhelming
                            </p>
                        </div>
                    </ScrollAnimationWrapper>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ScrollAnimationWrapper animation="slideUp" delay={0.1}>
                            <ThreeDCard glowColor="rgba(239, 68, 68, 0.3)">
                                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                                        <span className="text-3xl">😰</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Too Many Options</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        340+ colleges, thousands of branches, and countless factors to consider. Where do you even start?
                                    </p>
                                </div>
                            </ThreeDCard>
                        </ScrollAnimationWrapper>

                        <ScrollAnimationWrapper animation="slideUp" delay={0.2}>
                            <ThreeDCard glowColor="rgba(245, 158, 11, 0.3)">
                                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-6">
                                        <span className="text-3xl">📊</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Complex Data</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Cutoff ranks, percentiles, placement rates, fees - analyzing all this data manually is time-consuming.
                                    </p>
                                </div>
                            </ThreeDCard>
                        </ScrollAnimationWrapper>

                        <ScrollAnimationWrapper animation="slideUp" delay={0.3}>
                            <ThreeDCard glowColor="rgba(99, 102, 241, 0.3)">
                                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                                        <span className="text-3xl">❓</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Uncertain Chances</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Will you get admission? What are your actual chances? Traditional methods can't tell you.
                                    </p>
                                </div>
                            </ThreeDCard>
                        </ScrollAnimationWrapper>
                    </div>
                </div>
            </section>

            {/* The Solution Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="max-w-7xl mx-auto">
                    <ScrollAnimationWrapper animation="slideUp">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-6">
                                <AnimatedIcon type="brain" size={24} className="mr-2" />
                                <span className="text-sm font-medium text-indigo-700">Powered by AI</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Meet SmartCF
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Your AI-powered college finder that makes the complex simple
                            </p>
                        </div>
                    </ScrollAnimationWrapper>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <ScrollAnimationWrapper animation="slideRight">
                            <div className="relative">
                                <motion.div
                                    className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-20"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                                <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
                                    <div className="flex items-center justify-center mb-8">
                                        <AnimatedIcon type="brain" size={120} />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">Instant Analysis</div>
                                                <div className="text-sm text-gray-600">Process thousands of data points in seconds</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">Accurate Predictions</div>
                                                <div className="text-sm text-gray-600">95.7% accuracy based on historical data</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">Personalized Results</div>
                                                <div className="text-sm text-gray-600">Tailored to your profile and preferences</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollAnimationWrapper>

                        <ScrollAnimationWrapper animation="slideLeft">
                            <div className="space-y-6">
                                <h3 className="text-3xl font-bold text-gray-900">
                                    How AI Changes Everything
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Our advanced machine learning algorithms analyze your exam scores, rank, category, and preferences against historical admission data from 340+ engineering colleges.
                                </p>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    In seconds, you get personalized predictions showing your exact admission chances for each college and branch combination - something that would take weeks to research manually.
                                </p>
                                <div className="flex flex-wrap gap-3 pt-4">
                                    <div className="px-4 py-2 bg-white rounded-xl border border-indigo-200 text-indigo-700 font-medium shadow-sm">
                                        Machine Learning
                                    </div>
                                    <div className="px-4 py-2 bg-white rounded-xl border border-purple-200 text-purple-700 font-medium shadow-sm">
                                        Big Data Analysis
                                    </div>
                                    <div className="px-4 py-2 bg-white rounded-xl border border-pink-200 text-pink-700 font-medium shadow-sm">
                                        Real-time Updates
                                    </div>
                                </div>
                            </div>
                        </ScrollAnimationWrapper>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <ScrollAnimationWrapper animation="slideUp">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Your Journey to Success
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Four simple steps to find your perfect college
                            </p>
                        </div>
                    </ScrollAnimationWrapper>

                    <div className="relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 transform -translate-y-1/2" />

                        <div className="grid md:grid-cols-4 gap-8 relative">
                            {journeySteps.map((step, index) => (
                                <ScrollAnimationWrapper
                                    key={index}
                                    animation="scale"
                                    delay={index * 0.1}
                                >
                                    <ThreeDCard>
                                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg text-center relative">
                                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {index + 1}
                                            </div>
                                            <div className="mt-8 mb-6 flex justify-center">
                                                <AnimatedIcon type={step.icon} size={64} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                            <p className="text-gray-600">{step.description}</p>
                                        </div>
                                    </ThreeDCard>
                                </ScrollAnimationWrapper>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-indigo-50/30">
                <div className="max-w-7xl mx-auto">
                    <ScrollAnimationWrapper animation="slideUp">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Powerful Features
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Everything you need to make the right college decision
                            </p>
                        </div>
                    </ScrollAnimationWrapper>

                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <ScrollAnimationWrapper
                                key={index}
                                animation="slideUp"
                                delay={index * 0.1}
                            >
                                <ThreeDCard glowColor={`rgba(99, 102, 241, 0.3)`}>
                                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg h-full">
                                        <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                                            <AnimatedIcon type={feature.icon} size={40} className="text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                    </div>
                                </ThreeDCard>
                            </ScrollAnimationWrapper>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <ScrollAnimationWrapper animation="slideUp">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Success Stories
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Join thousands of students who found their dream college
                            </p>
                        </div>
                    </ScrollAnimationWrapper>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <ScrollAnimationWrapper
                                key={index}
                                animation="slideUp"
                                delay={index * 0.1}
                            >
                                <ThreeDCard>
                                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg h-full">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                                {testimonial.initials}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{testimonial.name}</div>
                                                <div className="text-sm text-indigo-600">{testimonial.college}</div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${testimonial.score}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-indigo-600">{testimonial.score}%</span>
                                        </div>
                                    </div>
                                </ThreeDCard>
                            </ScrollAnimationWrapper>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2%, transparent 2%)`,
                        backgroundSize: '50px 50px'
                    }} />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <ScrollAnimationWrapper animation="scale">
                        <div className="mb-8">
                            <AnimatedIcon type="rocket" size={80} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Find Your Dream College?
                        </h2>
                        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                            Join 52,000+ students who used SmartCF to make their college decision
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <motion.button
                                onClick={() => navigate("/signup")}
                                className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Get Started Free
                            </motion.button>
                            <motion.button
                                onClick={() => navigate("/college-explorer")}
                                className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Explore Colleges
                            </motion.button>
                        </div>
                    </ScrollAnimationWrapper>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12">
                        <div>
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <div className="text-white font-bold text-xl">S</div>
                                </div>
                                <div className="text-xl font-bold">SmartCF</div>
                            </div>
                            <p className="text-gray-400">
                                AI-powered college predictions for engineering students
                            </p>
                        </div>

                        <div>
                            <div className="font-bold text-lg mb-6">Product</div>
                            <ul className="space-y-3 text-gray-400">
                                <li><button className="hover:text-white transition-colors">Features</button></li>
                                <li><button className="hover:text-white transition-colors">How It Works</button></li>
                                <li><button className="hover:text-white transition-colors">Pricing</button></li>
                                <li><button className="hover:text-white transition-colors">FAQ</button></li>
                            </ul>
                        </div>

                        <div>
                            <div className="font-bold text-lg mb-6">Company</div>
                            <ul className="space-y-3 text-gray-400">
                                <li><button className="hover:text-white transition-colors">About Us</button></li>
                                <li><button className="hover:text-white transition-colors">Blog</button></li>
                                <li><button className="hover:text-white transition-colors">Careers</button></li>
                                <li><button className="hover:text-white transition-colors">Contact</button></li>
                            </ul>
                        </div>

                        <div>
                            <div className="font-bold text-lg mb-6">Legal</div>
                            <ul className="space-y-3 text-gray-400">
                                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                                <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
                                <li><button className="hover:text-white transition-colors">Cookie Policy</button></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                        <p className="text-gray-400">
                            © 2026 SmartCF. Empowering students with AI-driven college predictions.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
