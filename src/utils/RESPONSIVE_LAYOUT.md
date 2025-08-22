# 📱🖥️ Sistema de Layout Responsivo

Este tutorial mostra como usar os componentes responsivos no app ICEA Carpool para criar experiências que funcionam perfeitamente em mobile, tablet e web.

## 🎯 Visão Geral

O sistema responsivo fornece:
- **Detecção de plataforma** (mobile vs web)
- **Componentes responsivos** que se adaptam a diferentes tamanhos de tela
- **Hooks personalizados** para utilitários responsivos
- **Sistema de grid** para layouts flexíveis
- **Navegação inferior** apenas para telas mobile
- **Navegação lateral** apenas para telas web

## 🛠️ Componentes Disponíveis

### ResponsiveContainer
Wrapper principal que fornece comportamento responsivo:

```javascript
import { ResponsiveContainer } from '../components/ResponsiveLayout';

<ResponsiveContainer>
  <Text>Conteúdo que se adapta à plataforma</Text>
</ResponsiveContainer>
```

### ResponsiveGrid
Layout de grid que adapta o número de colunas baseado no tamanho da tela:

```javascript
import { ResponsiveGrid } from '../components/ResponsiveLayout';

<ResponsiveGrid columns={getResponsiveValue(1, 2, 3)}>
  <View>Item 1</View>
  <View>Item 2</View>
  <View>Item 3</View>
</ResponsiveGrid>
```

### ResponsiveCard
Cards que se adaptam à plataforma:

```javascript
import { ResponsiveCard } from '../components/ResponsiveLayout';

<ResponsiveCard>
  <Text>Conteúdo do card</Text>
</ResponsiveCard>
```

### MobileContainer
Container específico para layouts mobile com espaçamento para navegação inferior:

```javascript
import { MobileContainer } from '../components/ResponsiveLayout';

<MobileContainer>
  <Text>Conteúdo com espaçamento para navegação inferior</Text>
</MobileContainer>
```

## 🎣 Hook: useResponsive

O hook `useResponsive` fornece detecção de plataforma e utilitários responsivos:

```javascript
import { useResponsive } from '../hooks/useResponsive';

const { 
  isWeb, 
  isMobile, 
  isTablet, 
  isDesktop, 
  getResponsiveValue 
} = useResponsive();
```

### Propriedades Disponíveis

- **`isWeb`** - Boolean indicando se está rodando na web
- **`isMobile`** - Boolean indicando se está rodando no mobile
- **`isTablet`** - Boolean indicando se está rodando no tablet
- **`isDesktop`** - Boolean indicando se está rodando no desktop
- **`getResponsiveValue(mobile, tablet, desktop)`** - Retorna valor apropriado baseado no tamanho da tela

## 📱 Uso Básico

### 1. Container Responsivo Simples

```javascript
import React from 'react';
import { Text } from 'react-native';
import { ResponsiveContainer } from '../components/ResponsiveLayout';

const MeuComponente = () => {
  return (
    <ResponsiveContainer>
      <Text>Este conteúdo se adapta a diferentes tamanhos de tela</Text>
    </ResponsiveContainer>
  );
};
```

### 2. Layout de Grid Responsivo

```javascript
import React from 'react';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';

const ExemploGrid = () => {
  const { getResponsiveValue } = useResponsive();
  
  const items = [
    { id: 1, title: 'Item 1' },
    { id: 2, title: 'Item 2' },
    { id: 3, title: 'Item 3' },
  ];

  return (
    <ResponsiveContainer>
      <ResponsiveGrid columns={getResponsiveValue(1, 2, 3)}>
        {items.map(item => (
          <ResponsiveCard key={item.id}>
            <Text>{item.title}</Text>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
};
```

## 🔧 Padrões Avançados

### 1. Conteúdo Específico por Plataforma

```javascript
const getConteudoPorPlataforma = () => {
  if (isWeb) {
    return {
      titulo: 'Experiência Web',
      subtitulo: 'Otimizado para desktop e tablet',
      layout: 'grid',
      colunas: getResponsiveValue(2, 3, 4),
    };
  } else {
    return {
      titulo: 'Experiência Mobile',
      subtitulo: 'Otimizado para toque e telas pequenas',
      layout: 'lista',
      colunas: 1,
    };
  }
};
```

### 2. Estilos Responsivos

```javascript
const getEstilosResponsivos = () => {
  const estilosBase = {
    titulo: {
      fontSize: getResponsiveValue(24, 28, 32),
      fontWeight: 'bold',
      textAlign: 'center',
    },
  };

  // Sobrescritas específicas para web
  if (isWeb) {
    return {
      ...estilosBase,
      titulo: {
        ...estilosBase.titulo,
        fontSize: 36,
        padding: 40,
      },
    };
  }

  return estilosBase;
};
```

### 3. Renderização Condicional

```javascript
return (
  <ResponsiveContainer>
    <Text style={styles.titulo}>{conteudo.titulo}</Text>
    
    {/* Layout específico por plataforma */}
    {conteudo.layout === 'grid' ? (
      <ResponsiveGrid columns={conteudo.colunas}>
        {items.map(renderizarItem)}
      </ResponsiveGrid>
    ) : (
      <View style={styles.lista}>
        {items.map(renderizarItem)}
      </View>
    )}

    {/* Rodapé específico para web */}
    {isWeb && (
      <View style={styles.rodapeWeb}>
        <Text>Layout otimizado para web</Text>
      </View>
    )}
  </ResponsiveContainer>
);
```

## 🧭 Sistemas de Navegação

### BottomNavigation (Mobile)
Barra de navegação inferior que aparece apenas em telas mobile:

```javascript
import BottomNavigation from '../components/BottomNavigation';

<BottomNavigation 
  currentScreen={screen} 
  onScreenChange={setScreen}
/>
```

### SidebarNavigation (Web)
Navegação lateral que aparece apenas em telas web:

```javascript
import SidebarNavigation from '../components/SidebarNavigation';

<SidebarNavigation 
  currentScreen={screen} 
  onScreenChange={setScreen}
/>
```

## 📐 Sistema de Grid

O grid responsivo se adapta automaticamente ao tamanho da tela:

```javascript
// Mobile: 1 coluna
// Tablet: 2 colunas  
// Desktop: 3 colunas
<ResponsiveGrid columns={getResponsiveValue(1, 2, 3)}>
  {items.map(item => (
    <ResponsiveCard key={item.id}>
      <Text>{item.title}</Text>
    </ResponsiveCard>
  ))}
</ResponsiveGrid>
```

## 🎨 Diretrizes de Estilização

### Abordagem Mobile-First
1. Comece com estilos mobile
2. Adicione sobrescritas específicas para web
3. Use `getResponsiveValue()` para diferenças entre plataformas

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Escala de Tipografia
```javascript
const fontSize = getResponsiveValue(16, 18, 20); // mobile, tablet, desktop
const lineHeight = getResponsiveValue(20, 24, 28);
```

## ✅ Melhores Práticas

### 1. Use Valores Responsivos

Em vez de valores fixos, use `getResponsiveValue()`:

```javascript
// ❌ Ruim - Valores fixos
const fontSize = 24;

// ✅ Bom - Valores responsivos
const fontSize = getResponsiveValue(20, 24, 28);
```

### 2. Lógica Específica por Plataforma

Separe a lógica específica por plataforma em funções:

```javascript
const getConfiguracaoPlataforma = () => {
  if (isWeb) {
    return { layout: 'grid', colunas: 3 };
  }
  return { layout: 'lista', colunas: 1 };
};
```

### 3. Estilos Responsivos

Crie objetos de estilo responsivos:

```javascript
const styles = {
  container: {
    padding: getResponsiveValue(10, 20, 40),
    margin: getResponsiveValue(5, 10, 20),
  },
  titulo: {
    fontSize: getResponsiveValue(18, 24, 32),
    textAlign: isWeb ? 'center' : 'left',
  },
};
```

### 4. Componentes Condicionais

Use renderização condicional para recursos específicos por plataforma:

```javascript
{isWeb && <RecursoEspecificoWeb />}
{isMobile && <RecursoEspecificoMobile />}
```

## 🚀 Início Rápido

### 1. Importe os componentes responsivos:

```javascript
import { 
  ResponsiveContainer, 
  ResponsiveGrid, 
  ResponsiveCard, 
  MobileContainer 
} from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import BottomNavigation from '../components/BottomNavigation';
import SidebarNavigation from '../components/SidebarNavigation';
```

### 2. Use em seu componente:

```javascript
const MinhaTela = () => {
  const { isWeb, isMobile, getResponsiveValue } = useResponsive();
  
  // Use MobileContainer para mobile, ResponsiveContainer para web
  const Container = isMobile ? MobileContainer : ResponsiveContainer;
  
  return (
    <Container>
      <ResponsiveGrid columns={getResponsiveValue(1, 2, 3)}>
        <ResponsiveCard>Conteúdo</ResponsiveCard>
      </ResponsiveGrid>
    </Container>
  );
};
```

### 3. Adicione navegação no App.js:

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

## 📚 Exemplo Completo

```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard } from './ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';

const ExemploResponsivo = () => {
  const { isWeb, getResponsiveValue } = useResponsive();

  // Conteúdo específico por plataforma
  const conteudo = isWeb ? {
    titulo: 'Experiência Web',
    subtitulo: 'Otimizado para desktop e tablet',
    layout: 'grid',
    colunas: getResponsiveValue(2, 3, 4),
  } : {
    titulo: 'Experiência Mobile',
    subtitulo: 'Otimizado para toque e telas pequenas',
    layout: 'lista',
    colunas: 1,
  };

  // Estilos responsivos
  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#2d3748',
      ...(isWeb && { padding: 40, width: '100%', alignSelf: 'center' }),
    },
    titulo: {
      fontSize: getResponsiveValue(24, 28, 32),
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 10,
      ...(isWeb && { fontSize: 36 }),
    },
    subtitulo: {
      fontSize: getResponsiveValue(14, 16, 18),
      color: '#a0aec0',
      textAlign: 'center',
      marginBottom: 30,
    },
  };

  const items = [
    { id: 1, titulo: 'Recurso 1', descricao: 'Descrição do recurso 1' },
    { id: 2, titulo: 'Recurso 2', descricao: 'Descrição do recurso 2' },
    { id: 3, titulo: 'Recurso 3', descricao: 'Descrição do recurso 3' },
  ];

  const renderizarItem = (item) => (
    <ResponsiveCard key={item.id} style={styles.card}>
      <Text style={styles.cardTitulo}>{item.titulo}</Text>
      <Text style={styles.cardDescricao}>{item.descricao}</Text>
      <TouchableOpacity style={styles.cardBotao}>
        <Text style={styles.cardBotaoTexto}>Saiba Mais</Text>
      </TouchableOpacity>
    </ResponsiveCard>
  );

  return (
    <ResponsiveContainer style={styles.container}>
      <Text style={styles.titulo}>{conteudo.titulo}</Text>
      <Text style={styles.subtitulo}>{conteudo.subtitulo}</Text>
      
      {/* Layout específico por plataforma */}
      {conteudo.layout === 'grid' ? (
        <ResponsiveGrid columns={conteudo.colunas}>
          {items.map(renderizarItem)}
        </ResponsiveGrid>
      ) : (
        <View style={styles.lista}>
          {items.map(renderizarItem)}
        </View>
      )}

      {/* Rodapé específico para web */}
      {isWeb && (
        <View style={styles.rodapeWeb}>
          <Text style={styles.rodapeTexto}>
            Layout otimizado para web com {conteudo.colunas} colunas
          </Text>
        </View>
      )}
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescricao: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 15,
    lineHeight: 20,
  },
  cardBotao: {
    backgroundColor: '#4299e1',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cardBotaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  lista: {
    width: '100%',
  },
  rodapeWeb: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#4a5568',
    borderRadius: 8,
    alignItems: 'center',
  },
  rodapeTexto: {
    color: '#a0aec0',
    fontSize: 14,
  },
});

export default ExemploResponsivo;
```

## 📋 Resumo

O sistema de layout responsivo fornece:

1. **Detecção automática de plataforma** através do hook `useResponsive`
2. **Componentes responsivos** que se adaptam a diferentes tamanhos de tela
3. **Estilização flexível** com valores responsivos
4. **Recursos específicos por plataforma** através de renderização condicional

Seguindo estes padrões, você pode criar um único código que fornece experiências otimais em todas as plataformas mantendo código limpo e sustentável! 🎉
