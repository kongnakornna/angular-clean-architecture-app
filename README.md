# IC Mon Angular - Chatbot with Clean Architecture

> Chatbot 3 Accounts ที่ใช้ TypeScript + Clean Architecture + Domain-Driven Design (DDD) บน AngularJS 1.x
```
npm run start -- --port 4300

ng serve --port 4300

npm run start

```
## 📋 สารบัญ

- [ภาพรวมโปรเจกต์](#ภาพรวมโปรเจกต์)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [สถาปัตยกรรม](#สถาปัตยกรรม)
- [การติดตั้งและรันโปรเจกต์](#การติดตั้งและรันโปรเจกต์)
- [คำอธิบายแต่ละชั้น](#คำอธิบายแต่ละชั้น)
- [ตัวอย่างโค้ด](#ตัวอย่างโค้ด)
- [ข้อควรระวัง](#ข้อควรระวัง)
- [การย้ายไป Angular สมัยใหม่](#การย้ายไป-angular-สมัยใหม่)
- [License](#license)

---

## ภาพรวมโปรเจกต์

โปรเจกต์นี้เป็น **Chatbot** ที่ใช้ TypeScript ร่วมกับ **Clean Architecture** และ **Domain-Driven Design (DDD)** บน **AngularJS (1.x)** เพื่อสร้างโค้ดที่:

- ✅ **ไม่ผูกติดกับเฟรมเวิร์ก (Framework-agnostic)** - สามารถย้ายไป Angular หรือ React ได้ง่าย
- ✅ **แยกชั้นโค้ดอย่างชัดเจน (Separation of Concerns)** - Domain, Application, Infrastructure, Presentation
- ✅ **ทดสอบได้ง่าย (Testability)** - ทดสอบ Business Logic ได้โดยไม่ต้องเปิดเบราว์เซอร์
- ✅ **ใช้ DI ของ AngularJS** - จัดการ Dependency Injection ได้อย่างมีประสิทธิภาพ

### ฟีเจอร์หลัก

- 💬 แชทกับ AI (OpenCode API)
- 🔀 รองรับ 3 บัญชี (Account A, B, C)
- 🎯 เลือกบัญชีก่อนส่งข้อความ
- ⚡ Optimistic UI (แสดงข้อความทันที)

---

## โครงสร้างโปรเจกต์

```
src/
├── domain/                           # ชั้นหลัก (ไม่ขึ้นกับอะไรเลย)
│   ├── entities/                     # Entity หลัก
│   │   └── Message.ts
│   ├── aggregates/                   # Aggregate Root
│   │   └── ChatSession.ts
│   ├── value-objects/                # Value Objects
│   │   └── AccountId.ts
│   └── repositories/                 # Interface สำหรับชั้นนอก
│       └── IChatRepository.ts
│
├── application/                      # Use Cases (Orchestrator)
│   └── usecases/
│       └── SendMessageUseCase.ts
│
├── infrastructure/                   # ชั้นนอก (Implementation)
│   ├── services/
│   │   └── OpenCodeApiRepository.ts  # implements IChatRepository
│   └── config/
│       └── AccountConfig.ts
│
└── presentation/                     # ชั้น UI (AngularJS)
    ├── controllers/
    │   └── ChatController.ts
    └── module/
        └── app.module.ts             # ลงทะเบียน DI ของ AngularJS
```

---

## สถาปัตยกรรม

### Clean Architecture + DDD

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│                  (AngularJS Controllers)                     │
└───────────────────────────┬─────────────────────────────────┘
                            │ เรียก
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│                    (Use Cases)                               │
└───────────────────────────┬─────────────────────────────────┘
                            │ ใช้ Interface
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│           (Entities, Aggregates, Repository Interfaces)      │
└───────────────────────────┬─────────────────────────────────┘
                            │ Implement
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                       │
│              (API Services, Configurations)                  │
└─────────────────────────────────────────────────────────────┘
```

### หลักการ Dependency Inversion

- **Dependency ชี้เข้าหา Domain เสมอ** - Controller → Use Case → Repository Interface ← Repository Implementation
- **Domain ไม่รู้ว่าข้างนอกเป็นอย่างไร** - ไม่มี `$http`, `$scope` หรืออะไรที่เกี่ยวกับ AngularJS
- **สามารถเปลี่ยน Infrastructure ได้ง่าย** - เปลี่ยนจาก `$http` เป็น `Fetch` หรือเปลี่ยนโมเดล AI ได้โดยไม่ต้องแก้ Use Case หรือ Domain

---

## การติดตั้งและรันโปรเจกต์

### Prerequisites

- Node.js >= 14.x
- npm >= 6.x
- TypeScript >= 4.x

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า API Keys

แก้ไขไฟล์ `src/infrastructure/config/AccountConfig.ts`:

```typescript
export const ACCOUNT_LIST: IAccount[] = [
  { id: 'acc-1', name: 'บัญชี A', apiKey: 'sk-your-api-key-1' },
  { id: 'acc-2', name: 'บัญชี B', apiKey: 'sk-your-api-key-2' },
  { id: 'acc-3', name: 'บัญชี C', apiKey: 'sk-your-api-key-3' },
];
```

### 3. รันโปรเจกต์

```bash
npm start
```

### 4. Build สำหรับ Production

```bash
npm run build
```

---

## คำอธิบายแต่ละชั้น

### 1. Domain Layer (ใจกลางระบบ)

**ไม่มี** `$http`, `$scope` หรืออะไรที่เกี่ยวกับ AngularJS เลย มีแต่ Business Logic ล้วนๆ

#### Entities (`domain/entities/Message.ts`)

```typescript
export class Message {
  constructor(
    public readonly role: 'user' | 'assistant' | 'system',
    public readonly content: string,
    public readonly timestamp: Date = new Date()
  ) {}

  // Business Rule: ข้อความต้องไม่ว่าง
  public isValid(): boolean {
    return this.content.trim().length > 0;
  }
}
```

#### Aggregates (`domain/aggregates/ChatSession.ts`)

```typescript
import { Message } from '../entities/Message';

export class ChatSession {
  private _messages: Message[] = [];

  constructor(public readonly sessionId: string) {}

  public addMessage(message: Message): void {
    if (!message.isValid()) {
      throw new Error('ไม่สามารถเพิ่มข้อความว่างได้');
    }
    this._messages.push(message);
  }

  public getMessages(): Message[] {
    return [...this._messages]; // ป้องกันการแก้ไขจากภายนอก
  }

  public getLastUserMessage(): Message | undefined {
    return [...this._messages].reverse().find(m => m.role === 'user');
  }
}
```

#### Repository Interfaces (`domain/repositories/IChatRepository.ts`)

```typescript
import { Message } from '../entities/Message';

export interface IChatRepository {
  // ส่งข้อความประวัติทั้งหมดไปให้ AI แล้วรับคำตอบกลับ
  sendMessage(accountId: string, messages: Message[]): Promise<Message>;
}
```

---

### 2. Application Layer (Use Cases)

ชั้นนี้จะสั่งงาน Domain และเรียก Repository ผ่าน Interface (ไม่รู้ว่าข้างนอกเป็นอย่างไร)

#### Use Cases (`application/usecases/SendMessageUseCase.ts`)

```typescript
import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { ChatSession } from '../../domain/aggregates/ChatSession';
import { Message } from '../../domain/entities/Message';

export class SendMessageUseCase {
  // รับ Interface มา ไม่รับ Implementation โดยตรง (Dependency Inversion)
  constructor(private chatRepository: IChatRepository) {}

  public async execute(
    accountId: string,
    session: ChatSession,
    userInput: string
  ): Promise<string> {
    // 1. สร้าง Entity ใหม่ตาม Business Logic
    const userMessage = new Message('user', userInput);
    
    // 2. เพิ่มเข้า Aggregate (Domain จะตรวจสอบความถูกต้องเอง)
    session.addMessage(userMessage);

    // 3. ดึงประวัติทั้งหมดเพื่อส่งให้ AI
    const history = session.getMessages();

    // 4. เรียก Repository (Infrastructure) เพื่อส่ง API
    const assistantMessage = await this.chatRepository.sendMessage(accountId, history);

    // 5. บันทึกคำตอบของ AI กลับเข้า Session
    session.addMessage(assistantMessage);

    // 6. ส่งเฉพาะเนื้อหากลับไปแสดงผลที่ UI
    return assistantMessage.content;
  }
}
```

---

### 3. Infrastructure Layer (Implementation จริง)

ชั้นนี้จะ Implement Repository ที่ประกาศไว้ใน Domain โดยใช้ `$http` ของ AngularJS

#### Configuration (`infrastructure/config/AccountConfig.ts`)

```typescript
export interface IAccount {
  id: string;
  name: string;
  apiKey: string;
}

export const ACCOUNT_LIST: IAccount[] = [
  { id: 'acc-1', name: 'บัญชี A', apiKey: 'sk-aaaa' },
  { id: 'acc-2', name: 'บัญชี B', apiKey: 'sk-bbbb' },
  { id: 'acc-3', name: 'บัญชี C', apiKey: 'sk-cccc' },
];
```

#### API Repository (`infrastructure/services/OpenCodeApiRepository.ts`)

```typescript
import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Message } from '../../domain/entities/Message';
import { IAccount, ACCOUNT_LIST } from '../config/AccountConfig';

// ใช้ Decorator เพื่อบอก AngularJS ว่าให้ Inject อะไรบ้าง (จำเป็น)
export class OpenCodeApiRepository implements IChatRepository {
  // ประกาศ static $inject เพื่อให้ minification ทำงานได้
  public static $inject = ['$http'];

  constructor(private $http: ng.IHttpService) {}

  async sendMessage(accountId: string, messages: Message[]): Promise<Message> {
    // ค้นหา Account
    const account = ACCOUNT_LIST.find(acc => acc.id === accountId);
    if (!account) throw new Error('ไม่พบบัญชีนี้');

    // แปลง Message Entity เป็น JSON Payload
    const payload = {
      model: 'opencode/big-pickle',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.7,
    };

    try {
      const response = await this.$http({
        method: 'POST',
        url: 'https://api.opencode.ai/v1/chat/completions', // ปรับ URL จริง
        headers: {
          'Authorization': `Bearer ${account.apiKey}`,
          'Content-Type': 'application/json',
        },
        data: payload,
      }).toPromise(); // แปลง $q Promise เป็น async/await

      const replyContent = response.data.choices[0].message.content;
      
      // สร้าง Entity Message ใหม่สำหรับผู้ช่วย (Assistant)
      return new Message('assistant', replyContent);
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('เรียก API ไม่สำเร็จ');
    }
  }
}
```

---

### 4. Presentation Layer (AngularJS Controllers)

Controller จะเหลือแค่รับ Event จาก UI แล้วส่งต่อ Use Case โดยไม่มีการยุ่งกับ Business Logic

#### Controllers (`presentation/controllers/ChatController.ts`)

```typescript
import { SendMessageUseCase } from '../../application/usecases/SendMessageUseCase';
import { ChatSession } from '../../domain/aggregates/ChatSession';
import { ACCOUNT_LIST } from '../../infrastructure/config/AccountConfig';

export class ChatController {
  // ให้ AngularJS DI จัดการ Injection
  public static $inject = ['$scope', 'SendMessageUseCase'];

  public messages: { role: string; content: string }[] = [];
  public userInput: string = '';
  public isLoading: boolean = false;
  public selectedAccountId: string = ACCOUNT_LIST[0].id;
  public accountList = ACCOUNT_LIST;

  private session: ChatSession;

  constructor(
    private $scope: ng.IScope,
    private sendMessageUseCase: SendMessageUseCase
  ) {
    // สร้าง Session ใหม่ (ID อาจจะมาจาก Route)
    this.session = new ChatSession('session-123');
  }

  public async send() {
    if (!this.userInput.trim() || this.isLoading) return;

    // แสดงข้อความผู้ใช้ทันที (Optimistic UI)
    this.messages.push({ role: 'user', content: this.userInput });
    const input = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    try {
      // เรียก Use Case (ไม่ต้องรู้ว่าข้างในเรียก API ยังไง)
      const assistantReply = await this.sendMessageUseCase.execute(
        this.selectedAccountId,
        this.session,
        input
      );

      // แสดงข้อความตอบกลับ
      this.messages.push({ role: 'assistant', content: assistantReply });
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      this.isLoading = false;
      this.$scope.$applyAsync(); // อัปเดต UI
    }
  }
}
```

#### Module Registration (`presentation/module/app.module.ts`)

```typescript
import * as angular from 'angular';

// 1. Import ชั้น Infrastructure
import { OpenCodeApiRepository } from '../../infrastructure/services/OpenCodeApiRepository';
// 2. Import ชั้น Application
import { SendMessageUseCase } from '../../application/usecases/SendMessageUseCase';
// 3. Import Controller
import { ChatController } from '../controllers/ChatController';

// สร้าง AngularJS Module
const app = angular.module('chatbotApp', []);

// --- การลงทะเบียน DI (Manual Factory) ---

// ลงทะเบียน Repository (Infrastructure)
app.factory('IChatRepository', ['$http', ($http: ng.IHttpService) => {
  return new OpenCodeApiRepository($http);
}]);

// ลงทะเบียน Use Case (Application) โดย Inject Interface ที่ประกาศไว้
app.factory('SendMessageUseCase', ['IChatRepository', (repo: any) => {
  return new SendMessageUseCase(repo);
}]);

// ลงทะเบียน Controller
app.controller('ChatController', ChatController);

export default app;
```

---

## ตัวอย่างโค้ด

### ตัวอย่าง HTML (index.html)

```html
<!DOCTYPE html>
<html ng-app="chatbotApp">
<head>
  <meta charset="UTF-8">
  <title>Chatbot - 3 Accounts</title>
  <style>
    .chat-container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
    .user { background: #e3f2fd; text-align: right; }
    .assistant { background: #f5f5f5; }
    .loading { color: #999; font-style: italic; }
  </style>
</head>
<body ng-controller="ChatController as vm">
  <div class="chat-container">
    <h1>Chatbot</h1>
    
    <!-- เลือก Account -->
    <div>
      <label>เลือกบัญชี: </label>
      <select ng-model="vm.selectedAccountId"
              ng-options="acc.id as acc.name for acc in vm.accountList">
      </select>
    </div>

    <!-- แสดงข้อความ -->
    <div class="messages">
      <div ng-repeat="msg in vm.messages"
           class="message"
           ng-class="{'user': msg.role === 'user', 'assistant': msg.role === 'assistant'}">
        {{ msg.content }}
      </div>
      <div ng-if="vm.isLoading" class="loading">กำลังโหลด...</div>
    </div>

    <!-- Input -->
    <div>
      <input type="text"
             ng-model="vm.userInput"
             ng-keypress="vm.send()"
             placeholder="พิมพ์ข้อความ...">
      <button ng-click="vm.send()" ng-disabled="vm.isLoading">ส่ง</button>
    </div>
  </div>

  <script src="dist/bundle.js"></script>
</body>
</html>
```

---

## ข้อควรระวัง

### 1. Minification

ต้องประกาศ `public static $inject` ทุกคลาสที่ต้องการ DI เสมอ:

```typescript
export class MyController {
  public static $inject = ['$scope', 'MyService'];
  constructor(private $scope: ng.IScope, private myService: MyService) {}
}
```

### 2. Build Tool

ต้องมีตัวแปลง (เช่น Webpack, Gulp) เพื่อรวมไฟล์และแปลง TypeScript เป็น JavaScript ก่อนรันใน Browser

### 3. `this` Context

ใน AngularJS Controller ถ้าใช้ `async/await` หรือ `.then` ต้องระวังการผูก `this`:

```typescript
// ✅ ถูกต้อง - ใช้ Arrow Function
public send = async () => {
  // this ยังคงถูกต้อง
}

// ❌ ผิดพลาด - this จะหายไป
public async send() {
  // this เป็น undefined
}
```

### 4. tsconfig.json

ต้องตั้งค่า TypeScript ให้คอมไพล์เป็น ES5:

```json
{
  "compilerOptions": {
    "target": "ES5",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ES6", "DOM"]
  },
  "include": ["src/**/*"]
}
```

---

## การย้ายไป Angular สมัยใหม่

เนื่องจากโปรเจกต์ใช้ Clean Architecture ทำให้การย้ายไป Angular สมัยใหม่ทำได้ง่าย:

### ขั้นตอนการย้าย

1. **Domain Layer** - ไม่ต้องแก้เลย (ไม่มี Dependencies ใดๆ)
2. **Application Layer** - ไม่ต้องแก้เลย (ใช้ Interface เท่านั้น)
3. **Infrastructure Layer** - เปลี่ยนจาก `$http` เป็น `HttpClient`
4. **Presentation Layer** - เปลี่ยนจาก Controller เป็น Component

### ตัวอย่างการย้าย Infrastructure

```typescript
// เดิม (AngularJS)
export class OpenCodeApiRepository implements IChatRepository {
  public static $inject = ['$http'];
  constructor(private $http: ng.IHttpService) {}
}

// ใหม่ (Angular)
@Injectable()
export class OpenCodeApiRepository implements IChatRepository {
  constructor(private http: HttpClient) {}
}
```

---

## สรุปข้อดีของแนวทางนี้

| หลักการ | การประยุกต์ใช้กับโค้ดของเรา |
| :--- | :--- |
| **Domain-Driven Design (DDD)** | เรามี `ChatSession` Aggregate ที่คอยตรวจสอบข้อความว่าง และ `Message` Entity ที่ไม่ขึ้นกับเฟรมเวิร์ก ทำให้ Business Logic อยู่ตรงกลาง |
| **Clean Architecture** | เส้นลูกศร Dependency ชี้เข้าหา **Domain** เสมอ (Controller -> Use Case -> Repository Interface <- Repository Implementation) ทำให้เราสามารถเปลี่ยนจาก `$http` เป็น `Fetch` หรือเปลี่ยนโมเดล AI ได้ โดยไม่ต้องแก้ Use Case หรือ Domain |
| **Separation of Concerns** | UI (Controller) ไม่รู้ว่ามีบัญชี 3 บัญชีอยู่ที่ไหน หรือ API ส่งยังไง มันรู้แค่ว่าต้องเรียก `sendMessageUseCase.execute()` |
| **Testability** | คุณสามารถทดสอบ `SendMessageUseCase` โดยส่ง `Mock` Repository เข้าไป โดยไม่ต้องเปิดเว็บเบราว์เซอร์เลย |

---

## License

MIT License

---

*สร้างด้วย TypeScript + AngularJS 1.x + Clean Architecture + DDD*
