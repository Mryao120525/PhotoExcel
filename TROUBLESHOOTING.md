# 故障排除指南

## 如果应用无法运行，请尝试以下步骤：

### 1. 清除缓存并重新安装
```bash
# 删除 node_modules 和锁定文件
rm -rf node_modules
rm package-lock.json  # 或 yarn.lock

# 重新安装
npm install
# 或
yarn install
```

### 2. 清除 Expo 缓存
```bash
npx expo start --clear
```

### 3. 检查依赖是否正确安装
```bash
npm list @react-navigation/native @react-navigation/bottom-tabs @expo/vector-icons
```

### 4. 如果使用 Expo Go，确保版本兼容
某些原生模块可能需要在开发构建中使用，而不是 Expo Go。

### 5. 检查控制台错误
查看终端或浏览器控制台中的具体错误信息。

### 6. 常见错误及解决方案

#### 错误：`Unable to resolve module`
- 确保所有依赖都已安装
- 尝试删除 node_modules 并重新安装

#### 错误：`NavigationContainer must be used`
- 确保 App.js 中正确导入了 NavigationContainer

#### 错误：`Cannot read property 'navigate' of undefined`
- 确保组件在 NavigationContainer 内部使用
- 使用 `useNavigation` hook 获取 navigation 对象

#### 错误：`TypeError: expected dynamic type 'boolean', but had type 'string'`
- 检查样式数组中的条件表达式
- 将 `condition && style` 改为 `condition ? style : null`

