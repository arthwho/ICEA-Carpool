# 📱🖥️ Responsive Layout System

This document explains how to create different layouts for mobile and web platforms in your React Native app.

## 🎯 Overview

The responsive layout system provides:
- **Platform detection** (mobile vs web)
- **Responsive components** that adapt to different screen sizes
- **Custom hooks** for responsive utilities
- **Grid system** for flexible layouts
- **Bottom navigation** for mobile screens only
- **Sidebar navigation** for web screens only

## 🛠️ Components

### ResponsiveContainer
Automatically applies different styles for mobile and web:

```javascript
import { ResponsiveContainer } from '../components/ResponsiveLayout';

<ResponsiveContainer>
  <Text>Content that adapts to platform</Text>
</ResponsiveContainer>
```

### MobileContainer
Special container for mobile screens with bottom navigation spacing:

```javascript
import { MobileContainer } from '../components/ResponsiveLayout';

<MobileContainer>
  <Text>Content with bottom navigation spacing</Text>
</MobileContainer>
```

### ResponsiveGrid
Creates responsive grid layouts:

```javascript
import { ResponsiveGrid } from '../components/ResponsiveLayout';

<ResponsiveGrid columns={3}>
  <View>Item 1</View>
  <View>Item 2</View>
  <View>Item 3</View>
</ResponsiveGrid>
```

### ResponsiveCard
Cards that adapt to platform:

```javascript
import { ResponsiveCard } from '../components/ResponsiveLayout';

<ResponsiveCard>
  <Text>Card content</Text>
</ResponsiveCard>
```

### BottomNavigation
Bottom tab bar that only appears on mobile screens:

```javascript
import BottomNavigation from '../components/BottomNavigation';

<BottomNavigation 
  currentScreen={screen} 
  onScreenChange={setScreen}
/>
```

### SidebarNavigation
Sidebar navigation that only appears on web screens:

```javascript
import SidebarNavigation from '../components/SidebarNavigation';

<SidebarNavigation 
  currentScreen={screen} 
  onScreenChange={setScreen}
/>
```

## 🎣 Custom Hook: useResponsive

The `useResponsive` hook provides platform detection and responsive utilities:

```javascript
import { useResponsive } from '../hooks/useResponsive';

const MyComponent = () => {
  const { 
    isWeb, 
    isMobile, 
    isTablet, 
    isDesktop,
    getResponsiveValue,
    getResponsiveStyle 
  } = useResponsive();

  // Platform detection
  if (isWeb) {
    // Web-specific code
  } else {
    // Mobile-specific code
  }

  // Responsive values
  const fontSize = getResponsiveValue(16, 18, 20); // mobile, tablet, desktop
  const columns = getResponsiveValue(1, 2, 3);

  // Responsive styles
  const styles = getResponsiveStyle(
    { padding: 10 }, // mobile
    { padding: 20 }  // web
  );

  return <View style={styles}>...</View>;
};
```

## 📱 Mobile vs Web Layouts

### Mobile Layout
- **Single column** layouts
- **Touch-friendly** buttons and interactions
- **Compact** spacing and typography
- **Vertical scrolling** lists
- **Bottom navigation** bar with tabs
- **Extra padding** for bottom navigation

### Web Layout
- **Multi-column** grids
- **Hover effects** and mouse interactions
- **Larger** spacing and typography
- **Horizontal layouts** where appropriate
- **Sidebar navigation** on the left side
- **Content margin** to account for sidebar

## 🧭 Navigation Systems

### Bottom Navigation (Mobile)
The bottom navigation bar provides:
- **Mobile-only** display (hidden on web)
- **3 main tabs**: Caronas, Oferecer, Perfil
- **Active state** highlighting
- **Touch-friendly** design
- **Automatic spacing** for content

### Sidebar Navigation (Web)
The sidebar navigation provides:
- **Web-only** display (hidden on mobile)
- **Fixed position** on the left side
- **4 main items**: Início, Caronas, Oferecer Carona, Meu Perfil
- **Active state** highlighting with left border
- **Logo/branding** in header
- **250px width** with content margin adjustment

### Navigation Items
- 🏠 **Início** - Home screen
- 🚗 **Caronas** - Find rides
- ➕ **Oferecer Carona** - Offer rides
- 👤 **Meu Perfil** - User profile

## 🔧 Implementation Examples

### 1. Different Content Based on Platform

```javascript
const MyScreen = () => {
  const { isWeb } = useResponsive();

  const content = isWeb ? {
    title: 'Web Experience',
    subtitle: 'Optimized for desktop',
    layout: 'grid'
  } : {
    title: 'Mobile Experience', 
    subtitle: 'Optimized for touch',
    layout: 'list'
  };

  return (
    <ResponsiveContainer>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>
      
      {content.layout === 'grid' ? (
        <ResponsiveGrid columns={3}>
          {items.map(renderGridItem)}
        </ResponsiveGrid>
      ) : (
        <FlatList data={items} renderItem={renderListItem} />
      )}
    </ResponsiveContainer>
  );
};
```

### 2. Responsive Styles

```javascript
const MyComponent = () => {
  const { getResponsiveValue, getResponsiveStyle } = useResponsive();

  const styles = StyleSheet.create({
    container: getResponsiveStyle(
      { padding: 20 }, // mobile
      { padding: 40, maxWidth: 1200 } // web
    ),
    title: {
      fontSize: getResponsiveValue(24, 28, 32),
      fontWeight: 'bold',
    },
    button: {
      padding: getResponsiveValue(10, 15, 20),
      borderRadius: getResponsiveValue(5, 8, 10),
    }
  });

  return <View style={styles.container}>...</View>;
};
```

### 3. Platform-Specific Components

```javascript
const PlatformSpecificComponent = () => {
  const { isWeb } = useResponsive();

  if (isWeb) {
    return <WebVersion />;
  } else {
    return <MobileVersion />;
  }
};
```

### 4. Mobile Container with Bottom Navigation

```javascript
const MyScreen = () => {
  const { isMobile } = useResponsive();
  
  // Use MobileContainer for mobile, ResponsiveContainer for web
  const Container = isMobile ? MobileContainer : ResponsiveContainer;

  return (
    <Container>
      <Text>Content with proper spacing</Text>
    </Container>
  );
};
```

## 📐 Grid System

The responsive grid automatically adapts to screen size:

```javascript
// Mobile: 1 column
// Tablet: 2 columns  
// Desktop: 3 columns
<ResponsiveGrid columns={getResponsiveValue(1, 2, 3)}>
  {items.map(item => (
    <ResponsiveCard key={item.id}>
      <Text>{item.title}</Text>
    </ResponsiveCard>
  ))}
</ResponsiveGrid>
```

## 🎨 Styling Guidelines

### Mobile-First Approach
1. Start with mobile styles
2. Add web-specific overrides
3. Use `getResponsiveStyle()` for platform differences

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Typography Scale
```javascript
const fontSize = getResponsiveValue(16, 18, 20); // mobile, tablet, desktop
const lineHeight = getResponsiveValue(20, 24, 28);
```

### Navigation Spacing
- **Mobile**: Extra padding (100px) for bottom navigation
- **Web**: Left margin (250px) for sidebar navigation

## 🚀 Best Practices

1. **Use ResponsiveContainer** for main layouts
2. **Use MobileContainer** for mobile screens with bottom navigation
3. **Leverage ResponsiveGrid** for card layouts
4. **Use useResponsive hook** for complex logic
5. **Test on both platforms** regularly
6. **Keep mobile-first** in mind
7. **Use semantic naming** for responsive values
8. **No back buttons needed** - use appropriate navigation system

## 🔍 Testing

### Mobile Testing
- Use Expo Go on physical device
- Test touch interactions
- Verify scrolling behavior
- Test bottom navigation tabs
- Check bottom navigation spacing

### Web Testing
- Test in different browsers
- Resize window to test breakpoints
- Verify hover states
- Test sidebar navigation
- Check sidebar spacing and content margin

## 📚 Example Files

- `src/components/ResponsiveLayout.js` - Core responsive components
- `src/components/BottomNavigation.js` - Mobile bottom navigation
- `src/components/SidebarNavigation.js` - Web sidebar navigation
- `src/hooks/useResponsive.js` - Responsive utilities hook
- `src/components/ResponsiveExample.js` - Complete example
- `src/screens/HomeScreen.js` - Updated with responsive layout
- `src/screens/FindRideScreen.js` - Updated with responsive layout
- `src/screens/OfferRideScreen.js` - Updated with responsive layout
- `src/screens/ProfileScreen.js` - Updated with responsive layout

## 🎯 Quick Start

1. Import responsive components:
```javascript
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard, MobileContainer } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import BottomNavigation from '../components/BottomNavigation';
import SidebarNavigation from '../components/SidebarNavigation';
```

2. Use in your component:
```javascript
const MyScreen = () => {
  const { isWeb, isMobile, getResponsiveValue } = useResponsive();
  
  // Use MobileContainer for mobile, ResponsiveContainer for web
  const Container = isMobile ? MobileContainer : ResponsiveContainer;
  
  return (
    <Container>
      <ResponsiveGrid columns={getResponsiveValue(1, 2, 3)}>
        <ResponsiveCard>Content</ResponsiveCard>
      </ResponsiveGrid>
    </Container>
  );
};
```

3. Add navigation to App.js:
```javascript
<SidebarNavigation 
  currentScreen={screen} 
  onScreenChange={setScreen}
/>
<BottomNavigation 
  currentScreen={screen} 
  onScreenChange={setScreen}
/>
```

This system provides a clean, maintainable way to create platform-specific experiences while sharing code between mobile and web! 🎉
