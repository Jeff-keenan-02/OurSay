// components/SwipeDeck/SwipeDeck.tsx
import React, { useRef, useEffect } from "react";
import { View } from "react-native";

const CARD_AREA_HEIGHT = 380;
import Swiper from "react-native-deck-swiper";
import SwipeCard from "./SwipeCard";
import SwipeActions from "./SwipeActions";

type Props = {
  cards: any[];
  currentIndex: number; // <-- Controlled by parent
  onSwipeYes: (index: number) => void;
  onSwipeNo: (index: number) => void;
  onSwipeAllDone: () => void;
  disabled?: boolean; //  prevent double voting 
};



export default function SwipeDeck({cards, currentIndex, onSwipeYes, onSwipeNo, onSwipeAllDone, disabled = false,}: Props) {
  const swiperRef = useRef<any>(null);

  // When parent changes index, sync the swiper position
  useEffect(() => {
    if (swiperRef.current && typeof currentIndex === "number") {
      swiperRef.current.jumpToCardIndex(currentIndex);
    }
  }, [currentIndex]);

  return (
    <View style={{ flex: 1, flexDirection: "column", justifyContent: "space-between" }}>
      <View style={{ height: CARD_AREA_HEIGHT }}>
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

        disableLeftSwipe={disabled}
        disableRightSwipe={disabled}

        onSwipedLeft={(i) => onSwipeNo(i)}
        onSwipedRight={(i) => onSwipeYes(i)}

        renderCard={(card, index) =>
          card ? <SwipeCard card={card} index={index} /> : <View style={{ height: 340 }} />
        }

        overlayLabels={{
          left: {
            title: "NO",
            style: {
              label: {
                color: "#ff5252",
                fontSize: 42,
                fontWeight: "900",
                borderColor: "#ff5252",
                borderWidth: 3,
                borderRadius: 8,
                padding: 8,
              },
              wrapper: {
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "flex-start",
                marginTop: 30,
                marginLeft: -30,
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
                borderColor: "#4caf50",
                borderWidth: 3,
                borderRadius: 8,
                padding: 8,
              },
              wrapper: {
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                marginTop: 30,
                marginLeft: 30,
              },
            },
          },
        }}
      />
      </View>

      {/* Floating Yes/No Buttons */}
    <SwipeActions
      disabled={disabled}
      onYes={() => !disabled && swiperRef.current?.swipeRight()}
      onNo={() => !disabled && swiperRef.current?.swipeLeft()}
    />
    </View>
  );
}