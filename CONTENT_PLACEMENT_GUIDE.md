# Company Profile Content Placement Guide

This guide shows where each piece of content from your company profile screenshots should be placed on the website.

## 📄 **ABOUT PAGE** (`/about`)

### 1. **Hero Section** (Top of About Page)
**Content from:** Cover Page Screenshot
- ✅ **Title:** "COMPANY PROFILE" (already added)
- ✅ **Tagline:** "Making You Visible" (already added)
- 📸 **Image Placeholder:** Company cover image with printing machinery
  - **Location:** Hero section background or below title
  - **Content:** Large format printers, printing equipment, company logo

### 2. **"Hello There! We are" Section**
**Content from:** "Hello There! We are" Screenshot
- ✅ **Heading:** "Hello There! We are IAN PRINT PLC" (already added)
- ✅ **Company Introduction:** Full paragraph about IAN PRINT PLC (already added)
- ✅ **Tagline:** "Making You Visible" (already added)
- ✅ **Stats:** 2021 Established, 4+ Years Experience (already added)
- 📸 **Image Placeholder:** Company/team image
  - **Location:** Right side of the section
  - **Content:** Team photo, facility, or printing process

### 3. **Company Overview Section**
**Content from:** Company Overview Screenshot
- ✅ **Text:** "With years of experience... serving clients across various industries including corporate, education, hospitality, NGOs, and government institutions" (already added)
- ✅ **Mission/Vision Summary:** "Our mission is to empower brands..." (already added)
- 📸 **Image Placeholder:** Company Overview Image
  - **Location:** Right side of the section
  - **Content:** Industries served graphic, printer ink cartridges, company overview visual

### 4. **Mission, Vision & Core Values Section**
**Content from:** Mission/Vision/Values Screenshot
- ✅ **Mission:** Full mission statement (already added)
- ✅ **Vision:** Full vision statement (already added)
- ✅ **Core Values:** Quality Excellence, Innovation, Customer Focus, Integrity (already added)
- 📸 **Image Placeholder:** Mission/Vision/Values Graphic
  - **Location:** Bottom of the section
  - **Content:** Full graphic with hexagonal icons (1, 2, 3) showing Mission, Vision, and Core Values

### 5. **About Company Section**
**Content from:** "About Company" Screenshot
- ✅ **Company Details:** "Ian Print is a private Limited Company established in 2021 G.C..." (already added)
- ✅ **Company Philosophy:** "At Ian Print PLC, we believe that printing is more than just ink on paper..." (already added)
- 📸 **Image Placeholder:** Printing Equipment Images (2 images)
  - **Location:** Right side, grid layout
  - **Content:** Printing equipment, technology, or facility images

### 6. **Why Choose Us Section**
**Content from:** "Why Choose Us" Screenshot + Competitive Advantages Screenshot
- ✅ **Quality Assurance:** Full description (already added)
- ✅ **Timely Delivery:** Full description (already added)
- ✅ **Customer Satisfaction:** Full description (already added)
- ✅ **Competitive Pricing:** "High-quality services offered at fair and affordable prices" (already added)
- ✅ **Proven Experience:** "Trusted by businesses, NGOs, institutions, and individuals across Ethiopia" (already added)
- 📸 **Image Placeholder:** Why Choose Us Image
  - **Location:** Right side of the section
  - **Content:** Company sign, branded cap, advantages visual

### 7. **Our Machines Section**
**Content from:** Machines Screenshots (Sublimation, DTF, Banner, UV, CNC, Laser, Plotter, Plasma)
- ✅ **Flex Printing Introduction:** Description of flex printing services (already added)
- ✅ **Sublimation Machines:** Textile printing services description (already added)
- ✅ **DTF Machines:** DTF printing technology description (already added)
- ✅ **Banner Machines:** 5 Meter banner printing capability (already added)
- ✅ **UV Machines:** UV flatbed printing description (already added)
- ✅ **CNC Machines:** CNC routing description (already added)
- ✅ **Laser Cutting Machine:** Laser cutting description (already added)
- ✅ **Plotter Machine:** Wide-format printing description (already added)
- ✅ **Plasma Cutting Machine:** Plasma cutting description (already added)
- 📸 **Image Placeholders:** 8 machine images
  - **Location:** Grid layout (3 columns)
  - **Content:** 
    1. Sublimation Machine
    2. DTF Machine
    3. Banner Machine (5 Meter)
    4. UV Flatbed Printer
    5. CNC Routing Machine
    6. Laser Cutting Machine
    7. Plotter Machine
    8. Plasma Cutting Machine

---

## 📄 **CONTACT PAGE** (`/contact`)

### Contact Information Section
**Content from:** "Hello There! We are" Screenshot (Contact Details)
- ✅ **Phone Numbers:** +251 911-14-37-52, +251 903-42-81-83, +251 922-87-36-41 (already added)
- ✅ **Email:** ianprint2014@gmail.com (already added)
- ✅ **Address:** Meskel flower back side tolip Olympia hotel (already added)
- ✅ **Telegram:** @ianprintplc (already added)

---

## 📄 **HOME PAGE** (`/`)

### Hero Section
**Content from:** Cover Page Screenshot
- ✅ **Tagline:** "Making You Visible" (already added in hero section)

---

## 📸 **IMAGE PLACEMENT SUMMARY**

| Image Content | Page | Section | Placeholder Location |
|--------------|------|---------|---------------------|
| Cover page with machinery | About | Hero | Top of page |
| Company/team image | About | "Hello There!" | Right side |
| Company overview (industries, cartridges) | About | Company Overview | Right side |
| Mission/Vision/Values graphic | About | Mission/Vision/Values | Bottom of section |
| Printing equipment (2 images) | About | About Company | Right side grid |
| Why Choose Us (sign, cap) | About | Why Choose Us | Right side |
| Sublimation Machine | About | Our Machines | Grid layout |
| DTF Machine | About | Our Machines | Grid layout |
| Banner Machine (5 Meter) | About | Our Machines | Grid layout |
| UV Flatbed Printer | About | Our Machines | Grid layout |
| CNC Routing Machine | About | Our Machines | Grid layout |
| Laser Cutting Machine | About | Our Machines | Grid layout |
| Plotter Machine | About | Our Machines | Grid layout |
| Plasma Cutting Machine | About | Our Machines | Grid layout |

---

## ✅ **CONTENT STATUS**

All text content from your company profile has been integrated into the About page. You only need to:

1. **Replace image placeholders** with your actual images
2. **Update image paths** in `About.tsx` (currently using placeholder divs)
3. **Adjust image sizes** if needed to match your design

---

## 📝 **HOW TO ADD YOUR IMAGES**

1. Place your images in: `src/assets/images/`
2. Import them at the top of `About.tsx`:
   ```tsx
   import companyCover from '../assets/images/your-cover-image.png';
   ```
3. Replace the placeholder divs with:
   ```tsx
   <img src={companyCover} alt="Description" className="rounded-lg shadow-2xl" />
   ```

---

## 🎯 **PAGE STRUCTURE OVERVIEW**

**About Page Flow:**
1. Hero (Company Profile title + cover image)
2. Hello There! (Introduction + team image)
3. Company Overview (Industries + overview image)
4. Mission/Vision/Values (Full content + graphic)
5. Services (Printing solutions)
6. Why Choose Us (Advantages + image)
7. Our Machines (8 machines with descriptions)
8. About Company (Details + equipment images)
9. CTA (Call to action)

All content from your company profile screenshots is now organized and ready for your images!
