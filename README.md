# Password Manager

```
npm install
npm start
```

### Changes

```html
<head>
<link rel="stylesheet" href="./css/bootstrap.min.css">
</head>
```

```html
<body>
<script src="./js/bootstrap.min.js"></script>
<script src="./js/popper.min.js"></script>
</body>
```

delete >
//# sourceMappingURL=bootstrap.bundle.min.js.map
from > bootstrap.bundle.min.js

delete >
//# sourceMappingURL=popper.min.js.map
from > popper.min.js

delete >
//# sourceMappingURL=bootstrap.min.js.map
from > bootstrap.min.js

main.js >
```javascript
webPreferences: {
  contextIsolation: true
}
```
