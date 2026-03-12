---
title: About
slug: careers
sections:
  - title:
      text: A studio built around light, pace, and trust
      color: text-dark
      styles:
        self:
          textAlign: center
      type: TitleBlock
    subtitle: About Ziaozhao Photography
    text: >-
      The work here is quiet by design. I want space for people to move, talk,
      breathe, and settle into themselves while I shape the frame around what is
      already happening. That balance between observation and direction is what
      gives the photographs their ease.
    actions:
      - label: Start your inquiry
        url: /#contact-form
        icon: arrowRight
        iconPosition: right
        style: primary
        type: Button
    colors: bg-neutral-fg-dark
    styles:
      self:
        padding:
          - pt-40
          - pl-4
          - pb-40
          - pr-4
        alignItems: center
        flexDirection: row-reverse
        justifyContent: center
      text:
        textAlign: center
      subtitle:
        textAlign: center
    type: GenericSection
    backgroundImage:
      type: BackgroundImage
      altText: Abstract studio background
      backgroundSize: cover
      backgroundPosition: center
      backgroundRepeat: no-repeat
      opacity: 100
      url: /images/abstract-background.svg
  - title:
      text: The people behind the gallery
      color: text-dark
      styles:
        self:
          textAlign: center
      type: TitleBlock
    people:
      - content/data/person1.json
      - content/data/person2.json
      - content/data/person3.json
      - content/data/person4.json
      - content/data/person5.json
      - content/data/person6.json
    variant: three-col-grid
    colors: bg-light-fg-dark
    styles:
      self:
        padding:
          - pt-16
          - pl-16
          - pb-16
          - pr-16
        justifyContent: center
      subtitle:
        textAlign: center
    type: FeaturedPeopleSection
  - title:
      text: How a session usually flows
      color: text-dark
      styles:
        self:
          textAlign: center
      type: TitleBlock
    subtitle: A simple structure that keeps the experience easy and the work intentional
    items:
      - title: Discovery
        subtitle: Call and planning notes
        text: >-
          We talk about what matters most, how the photographs will be used, and
          what pace will help the session feel natural.
        colors: bg-neutral-fg-dark
        styles:
          self:
            padding:
              - pt-8
              - pl-8
              - pb-8
              - pr-8
            textAlign: left
            borderRadius: x-large
            flexDirection: row
            justifyContent: center
        type: FeaturedItem
      - title: Shoot day
        subtitle: Guided, calm, and efficient
        text: >-
          I direct lightly, watch the in-between moments closely, and keep the
          atmosphere relaxed so the frame never feels forced.
        colors: bg-neutral-fg-dark
        styles:
          self:
            padding:
              - pt-8
              - pl-8
              - pb-8
              - pr-8
            textAlign: left
            borderRadius: x-large
            flexDirection: row
            justifyContent: center
        type: FeaturedItem
      - title: Delivery
        subtitle: Edited for consistency and longevity
        text: >-
          Final images are color-balanced, sequenced, and delivered as a gallery
          that reads like a complete story rather than a folder of singles.
        colors: bg-neutral-fg-dark
        styles:
          self:
            padding:
              - pt-8
              - pl-8
              - pb-8
              - pr-8
            borderRadius: x-large
            flexDirection: row
        type: FeaturedItem
    actions:
      - label: Check collections
        url: /pricing
        icon: arrowRight
        iconPosition: right
        style: primary
        type: Button
    variant: toggle-list
    colors: bg-light-fg-dark
    styles:
      self:
        padding:
          - pb-40
          - pt-16
          - pl-3
          - pr-3
        justifyContent: center
      subtitle:
        textAlign: center
    type: FeaturedItemsSection
seo:
  metaTitle: About - Ziaozhao Photography
  metaDescription: Meet the studio and learn how sessions are planned and photographed.
  socialImage: /images/main-hero.jpg
  type: Seo
type: PageLayout
---