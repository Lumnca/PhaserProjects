# Character 类使用说明

## 概述
`Character` 类是一个基于 Phaser.js 的角色管理类，专门用于处理具有多种动画状态（静止、移动、攻击）的游戏角色。该类支持自动镜像翻转，使角色能够面向不同方向。

## 功能特性

### 动画支持
- **静止动画 (Idle)**: 角色静止不动时的状态
- **移动动画 (Move)**: 角色移动时的帧动画序列
- **攻击动画 (Attack)**: 角色攻击时的帧动画序列

### 方向控制
- 自动镜像翻转：当角色向左移动时，图像会自动水平翻转
- 默认面向右侧，移动时自动调整方向

### 状态管理
- 移动状态检测
- 攻击状态检测
- 方向状态跟踪

## 文件结构要求

角色资源文件应按照以下结构组织：
```
assets/battle/[characterKey]/
├── [characterKey].png                    # 静止状态图片
├── [characterKey]_move_00000.png         # 移动动画帧 0
├── [characterKey]_move_00001.png         # 移动动画帧 1
├── [characterKey]_move_00002.png         # 移动动画帧 2
├── [characterKey]_move_00003.png         # 移动动画帧 3
├── [characterKey]_move_00004.png         # 移动动画帧 4
├── [characterKey]_move_00005.png         # 移动动画帧 5
├── [characterKey]_move_00006.png         # 移动动画帧 6
├── [characterKey]_move_00007.png         # 移动动画帧 7
├── [characterKey]_att_00000.png          # 攻击动画帧 0
├── [characterKey]_att_00001.png          # 攻击动画帧 1
└── [characterKey]_att_00002.png          # 攻击动画帧 2
```

## 使用方法

### 1. 在场景中预加载资源
```javascript
preload() {
    // 加载角色资源
    Character.preload(this, 'barbar_worker');
}
```

### 2. 创建角色实例
```javascript
create() {
    // 创建角色 (x, y, characterKey)
    this.character = new Character(this, 640, 500, 'barbar_worker');
}
```

### 3. 控制角色移动
```javascript
update() {
    // 向左移动
    if (this.cursors.left.isDown) {
        this.character.moveLeft();
    }
    // 向右移动
    else if (this.cursors.right.isDown) {
        this.character.moveRight();
    }
    // 停止移动
    else {
        this.character.stop();
    }
}
```

### 4. 控制角色攻击
```javascript
// 触发攻击动画
this.character.attack();
```

## API 参考

### 构造函数
```javascript
new Character(scene, x, y, characterKey)
```
- `scene`: Phaser 场景对象
- `x, y`: 角色初始位置
- `characterKey`: 角色资源键名

### 静态方法

#### `Character.preload(scene, characterKey)`
预加载角色所需的所有资源文件。

### 实例方法

#### `moveLeft()`
使角色向左移动，自动翻转图像。

#### `moveRight()`
使角色向右移动。

#### `stop()`
停止角色移动，播放静止动画。

#### `attack()`
播放攻击动画。攻击期间无法移动。

#### `setMoveSpeed(speed)`
设置角色移动速度。

#### `getState()`
获取角色当前状态信息：
```javascript
{
    isMoving: boolean,      // 是否正在移动
    isAttacking: boolean,   // 是否正在攻击
    facingRight: boolean,   // 是否面向右侧
    x: number,             // X坐标
    y: number              // Y坐标
}
```

## 示例场景

项目包含一个完整的演示场景 `CharacterDemo`，展示了如何使用 Character 类：

1. 启动游戏后，点击"角色演示"按钮
2. 使用方向键控制角色移动
3. 按空格键进行攻击
4. 观察角色的动画状态和方向变化

## 自定义配置

### 修改动画帧率
在 `createAnimations()` 方法中调整 `frameRate` 参数：
```javascript
// 移动动画帧率
frameRate: 12,

// 攻击动画帧率
frameRate: 8,
```

### 修改移动速度
```javascript
this.character.setMoveSpeed(300); // 设置移动速度为300
```

### 添加新的动画状态
可以在 `createAnimations()` 方法中添加新的动画定义，并在 `animations` 对象中添加对应的引用。

## 注意事项

1. 确保所有帧图像文件都存在且命名正确
2. 攻击动画期间角色无法移动
3. 图像默认面向右侧，向左移动时会自动翻转
4. 角色会自动添加到场景中，无需手动调用 `scene.add()` 