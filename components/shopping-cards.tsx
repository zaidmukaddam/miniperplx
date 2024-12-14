"use client";
/* eslint-disable @next/next/no-img-element */
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Badge } from "./ui/badge";
import { Heart, Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";


interface ShoppingProduct {
    id: string | number;
    title: string;
    price: string;
    originalPrice?: string;
    currency: string;
    image: string;
    link: string;
    source: string;
    rating?: string | null;
    reviewCount?: string | null;
    delivery: string;
}

interface CardRotateProps {
    children: React.ReactNode;
    onSendToBack: () => void;
    onSwipe?: (direction: 'left' | 'right') => void;
}

function CardRotate({ children, onSendToBack, onSwipe }: CardRotateProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    // Reduced rotation values for more subtle effect
    const rotateX = useTransform(y, [-100, 100], [15, -15]);
    const rotateY = useTransform(x, [-100, 100], [-15, 15]);

    function handleDragEnd(_: any, info: PanInfo) {
        const threshold = 100;
        if (Math.abs(info.offset.x) > threshold) {
            onSendToBack();
            if (onSwipe) {
                onSwipe(info.offset.x > 0 ? 'right' : 'left');
            }
        } else {
            x.set(0);
            y.set(0);
        }
    }

    return (
        <motion.div
            className="absolute w-full h-full cursor-grab"
            style={{ x, y, rotateX, rotateY }}
            drag
            dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
            dragElastic={0.4} // Reduced elasticity
            whileTap={{ cursor: "grabbing" }}
            onDragEnd={handleDragEnd}
        >
            {children}
        </motion.div>
    );
}

const ProductCard = ({ product }: { product: ShoppingProduct }) => {
    const formattedPrice = parseFloat(product.price).toFixed(2);
    const formattedOriginalPrice = product.originalPrice ? parseFloat(product.originalPrice).toFixed(2) : null;
    const discount = formattedOriginalPrice ?
        Math.round(((parseFloat(formattedOriginalPrice) - parseFloat(formattedPrice)) / parseFloat(formattedOriginalPrice)) * 100) : null;

    return (
        <div className="w-full h-full bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-[60%] bg-neutral-100 dark:bg-neutral-700 p-4">
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                />
                {discount && discount > 0 && (
                    <Badge
                        className="absolute top-4 right-4 bg-red-500 text-white"
                        variant="secondary"
                    >
                        {discount}% OFF
                    </Badge>
                )}
            </div>
            <div className="p-4 h-[40%] flex flex-col justify-between">
                <div>
                    <h3 className="font-medium text-lg line-clamp-2 mb-2 text-neutral-800 dark:text-neutral-200">
                        {product.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ${formattedPrice}
                        </span>
                        {formattedOriginalPrice && (
                            <span className="text-sm line-through text-neutral-500">
                                ${formattedOriginalPrice}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                        {product.rating && (
                            <>
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {product.rating} {product.reviewCount && `(${product.reviewCount})`}
                                </span>
                            </>
                        )}
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {product.source}
                    </span>
                </div>
            </div>
        </div>
    );
};

export const SwipeableProductStack = ({ products }: { products: ShoppingProduct[] }) => {
    const [cards, setCards] = useState(products);
    const [savedProducts, setSavedProducts] = useState<ShoppingProduct[]>([]);

    const sendToBack = (id: string | number, direction?: 'left' | 'right') => {
        setCards((prev) => {
            const newCards = [...prev];
            const index = newCards.findIndex((card) => card.id === id);
            const [card] = newCards.splice(index, 1);

            if (direction === 'right') {
                setSavedProducts(prev => [...prev, card]);
                toast.success('Product saved!');
            }

            newCards.unshift(card);
            return newCards;
        });
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative w-full max-w-md aspect-[3/4]" style={{ perspective: 1000 }}>
                {cards.map((product, index) => (
                    <CardRotate
                        key={product.id}
                        onSendToBack={() => sendToBack(product.id)}
                        onSwipe={(direction) => sendToBack(product.id, direction)}
                    >
                        <motion.div
                            className="h-full w-full"
                            animate={{
                                rotateZ: (cards.length - index - 1) * 2, // Reduced rotation
                                scale: 1 - index * 0.03, // Reduced scale difference
                                y: index * 8, // Reduced vertical offset
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    </CardRotate>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full w-16 h-16 p-0" // Fixed size circular buttons
                    onClick={() => cards[cards.length - 1] && sendToBack(cards[cards.length - 1].id, 'left')}
                >
                    <X className="h-8 w-8 text-red-500" />
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full w-16 h-16 p-0" // Fixed size circular buttons
                    onClick={() => cards[cards.length - 1] && sendToBack(cards[cards.length - 1].id, 'right')}
                >
                    <Heart className="h-8 w-8 text-green-500" />
                </Button>
            </div>

            {savedProducts.length > 0 && (
                <div className="w-full mt-8">
                    <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                        Saved Products ({savedProducts.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {savedProducts.map((product) => (
                            <Card key={product.id} className="overflow-hidden">
                                <CardContent className="p-3">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full aspect-square object-contain mb-2"
                                    />
                                    <div className="text-sm font-medium line-clamp-1">{product.title}</div>
                                    <div className="text-base font-bold text-green-600 dark:text-green-400">
                                        ${parseFloat(product.price).toFixed(2)}
                                    </div>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() => window.open(product.link, '_blank')}
                                    >
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};