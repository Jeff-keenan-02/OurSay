// Centralized typography scale for the entire app.
// These styles ensure consistent text sizing and hierarchy across screens.

export const typography = {
  /**
   * Largest screen title.
   * Use for top-level page headers such as:
   * - "Poll Topics"
   * - "Community Discussions"
   * - "OurSay"
   */
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  /**
   * Section-level header.
   * Use within a screen to introduce a major block:
   * - "Trending Discussions"
   * - "Featured This Week"
   */
  header: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.15,
  },

  /**
   * Card titles and major item titles.
   * Use inside components:
   * - TopicCard titles
   * - Discussion titles
   */
  title: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.1,
  },

  /**
   * Secondary headings.
   * Good for subtitles or descriptive headings:
   * - Short descriptions under titles
   * - Section captions
   */
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.9,
  },

  /**
   * Default body text for paragraphs.
   * Use anywhere standard reading text is required.
   */
  body: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },

  /**
   * Small metadata text.
   * Use for:
   * - timestamps
   * - "3 comments"
   * - "Last updated"
   */
  small: {
    fontSize: 12,
    fontWeight: "400",
    opacity: 0.7,
  },
} as const;