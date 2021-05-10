# Animalia DS Brand

Repositório contendo os brand tokens e os custom properties da marca Animalia DS.
Para gerar os tokens utilizamos no Style dictionary.

Atualmente, é gerado os tokens para a seguinte tecnologia:
- CSS
  
## Gerando o pacote da marca

Você precisa ter instalado na sua máquina o [NodeJS](https://nodejs.org/en/).

Depois de já ter instalado o NodeJS, você precisa baixar o repositório.
E depois executar o seguinte comando:

```
npm run build
```

Este comando irá executar um script que irá gerar o pacote da marca
na pasta `dist`, da seguinte forma:

```
dist
  |-- package.json
  |-- theme.css
  |-- fonts
```

## Como usar

Faça download do pacote utilizando o [NPM](https://www.npmjs.com/), da seguinte forma:

```
npm install @animaliads/animalia-brand
```