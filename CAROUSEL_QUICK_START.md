# 🚀 PageCarousel - Quick Start Guide

## ⚡ 30-Second Setup

### 1. Import the Component
```jsx
import PageCarousel from '../components/PageCarousel'
```

### 2. Add Your Images
```jsx
const myImages = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg'
]
```

### 3. Use the Component
```jsx
<PageCarousel 
  images={myImages}
  autoSlide={true}
  interval={5000}
/>
```

**That's it!** 🎉

---

## 🎨 Common Patterns

### Pattern 1: Hero Carousel (Full Height)
```jsx
<PageCarousel 
  images={heroSlides}
  autoSlide={true}
  interval={5000}
  height="h-64 md:h-96 lg:h-[500px]"
/>
```

### Pattern 2: Small Banner (Medium Height)
```jsx
<PageCarousel 
  images={banners}
  autoSlide={true}
  interval={4000}
  height="h-48 md:h-64 lg:h-80"
/>
```

### Pattern 3: Compact Offers (Small Height)
```jsx
<PageCarousel 
  images={offers}
  autoSlide={true}
  interval={3000}
  height="h-32 md:h-40 lg:h-48"
/>
```

---

## 🖼️ Image Format Options

### Option A: Simple URLs
```jsx
const images = [
  '/banners/slide1.jpg',
  '/banners/slide2.jpg',
  '/banners/slide3.jpg'
]
```

### Option B: With Text Overlays
```jsx
const images = [
  {
    src: '/banners/slide1.jpg',
    alt: 'First Slide',
    title: 'Main Heading',
    description: 'Supporting text'
  },
  {
    src: '/banners/slide2.jpg',
    alt: 'Second Slide',
    title: 'Another Heading',
    description: 'More details here'
  }
]
```

---

## 🔧 All Props

| Prop | Default | Example |
|------|---------|---------|
| `images` | `[]` | `[{src: '...', title: '...'}]` |
| `autoSlide` | `true` | `false` to disable |
| `interval` | `5000` | `3000` (3 seconds) |
| `showDots` | `true` | `false` to hide |
| `showArrows` | `true` | `false` to hide |
| `height` | `'h-64 md:h-96 lg:h-[500px]'` | `'h-40 md:h-56'` |

---

## 📍 Already Implemented

✅ **Home Page** - Hero carousel with 4 slides  
✅ **Products Page** - Banner carousel with 3 slides  
✅ **Cart Page** - Offers carousel with 3 slides

---

## 🔄 Replace Placeholder Images

**Current:** Using Unsplash placeholder images

**To Replace:**

1. **Add your images to:**
   ```
   frontend/public/banners/
   ```

2. **Update the image array:**
   ```jsx
   // From:
   src: 'https://images.unsplash.com/...'
   
   // To:
   src: '/banners/your-image.jpg'
   ```

3. **Save and refresh!**

---

## ❓ Quick Troubleshooting

**Images not showing?**
- Check the URL/path is correct
- Verify images exist in `public/banners/`
- Check browser console for errors

**Not auto-sliding?**
- Ensure `autoSlide={true}`
- Check you have more than 1 image
- Verify `interval` is a number

**Arrows not visible?**
- Hover over the carousel
- Ensure `showArrows={true}`
- Check you have more than 1 image

---

## 📚 Full Documentation

For detailed information, see: `CAROUSEL_IMPLEMENTATION.md`

---

**Need Help?** Check the examples in:
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/Products.jsx`
- `frontend/src/pages/Cart.jsx`



