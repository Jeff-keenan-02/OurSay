// components/SwipeDeck/SwipeDeck.tsx
import React, { useRef, useEffect } from "react";
import { View } from "react-native";
import Swiper from "react-native-deck-swiper";
import SwipeCard from "./SwipeCard";
import SwipeActions from "./SwipeActions";

type Props = {
  cards: any[];
  currentIndex: number; // <-- Controlled by parent
  onSwipeYes: (index: number) => void;
  onSwipeNo: (index: number) => void;
  onSwipeAllDone: () => void;
};

export default function SwipeDeck({cards, currentIndex, onSwipeYes, onSwipeNo, onSwipeAllDone,}: Props) {
  const swiperRef = useRef<any>(null);

  // When parent changes index, sync the swiper position
  useEffect(() => {
    if (swiperRef.current && typeof currentIndex === "number") {
      swiperRef.current.jumpToCardIndex(currentIndex);
    }
  }, [currentIndex]);

  return (
    <View style={{ flex: 1 }}>
      <Swiper
        ref={swiperRef}
        cards={cards}
        cardIndex={currentIndex}
        verticalSwipe={false}
        backgroundColor="transparent"
        stackSize={2}
        stackScale={6}
        stackSeparation={12}
        animateCardOpacity

        onSwipedLeft={(i) => onSwipeNo(i)}
        onSwipedRight={(i) => onSwipeYes(i)}

        onSwiped={(i) => {
          const next = i + 1;
          if (next >= cards.length) {
            onSwipeAllDone();
          }
        }}

        renderCard={(card) =>
          card ? <SwipeCard card={card} /> : <View style={{ height: 420 }} />
        }

        overlayLabels={{
          left: {
            title: "NO",
            style: {
              label: {
                color: "#ff5252",
                fontSize: 42,
                fontWeight: "900",
              },
            },
          },
          right: {
            title: "YES",
            style: {
              label: {
                color: "#4caf50",
                fontSize: 42,
                fontWeight: "900",
              },
            },
          },
        }}
      />

      {/* Floating Yes/No Buttons */}
      <SwipeActions
        onYes={() => swiperRef.current?.swipeRight()}
        onNo={() => swiperRef.current?.swipeLeft()}
      />
    </View>
  );
}