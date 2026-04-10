# WhatsApp Clone — Complete Agent Build Plan

> Feed this document to any AI agent for a one-shot, phase-by-phase build.
> Stack: Next.js 14 (App Router) · Tailwind CSS · NestJS · Socket.IO · PostgreSQL · Redis · Prisma · JWT · Cloudinary

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) | UI, routing, SSR |
| Styling | Tailwind CSS + shadcn/ui | WhatsApp design system |
| State | Zustand | Client-side state |
| Real-time (client) | Socket.IO client | Chat, presence, typing |
| Backend | NestJS | REST API + WebSocket gateway |
| Real-time (server) | Socket.IO (NestJS gateway) | WebSocket server |
| ORM | Prisma | Database access |
| Database | PostgreSQL | Persistent storage |
| Cache / Pub-Sub | Redis | Sessions, socket pub/sub, online presence |
| Auth | JWT (access + refresh tokens) | Stateless auth |
| File Storage | Cloudinary | Avatar + media uploads |
| Validation | class-validator + zod | DTO & form validation |
| Package Manager | pnpm | Monorepo tooling |
| Monorepo | Turborepo | apps/web + apps/api shared types |
| Containerization | Docker + docker-compose | Local dev environment |

---

## Repository Structure

```
whatsapp-clone/
├── apps/
│   ├── web/                  # Next.js frontend
│   └── api/                  # NestJS backend
├── packages/
│   └── shared/               # Shared TypeScript types & DTOs
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## WhatsApp Design System (Tailwind Config)

Use these exact color tokens in `tailwind.config.ts` to replicate WhatsApp:

```ts
colors: {
  wa: {
    green:        '#25D366',   // Primary brand green
    'green-dark': '#128C7E',   // Dark green (header)
    'green-teal': '#075E54',   // Teal (top bar)
    'bg-light':   '#ECE5DD',   // Chat background (light)
    'bg-dark':    '#0B141A',   // Chat background (dark)
    'panel-light':'#FFFFFF',
    'panel-dark': '#111B21',
    'bubble-out': '#DCF8C6',   // Outgoing message bubble
    'bubble-in':  '#FFFFFF',   // Incoming message bubble
    'bubble-out-dark': '#005C4B',
    'bubble-in-dark':  '#202C33',
    'tick-blue':  '#53BDEB',   // Double blue tick
    'divider':    '#E9EDEF',
    'text-primary':   '#111B21',
    'text-secondary': '#667781',
    'text-meta':      '#8696A0',
    'icon':           '#54656F',
    'search-bg':      '#F0F2F5',
    'unread-badge':   '#25D366',
  }
}
```

---

## Phase 1 — Project Scaffolding & Infrastructure

**Goal:** Monorepo running with DB, Redis, and both apps booting.

### 1.1 Monorepo Setup

```bash
mkdir whatsapp-clone && cd whatsapp-clone
pnpm init
pnpm add -D turbo
```

`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev":   { "cache": false, "persistent": true },
    "lint":  {}
  }
}
```

Root `package.json`:
```json
{
  "name": "whatsapp-clone",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev":   "turbo run dev",
    "build": "turbo run build",
    "lint":  "turbo run lint"
  }
}
```

### 1.2 Shared Types Package

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── chat.types.ts
│   │   ├── message.types.ts
│   │   └── socket.types.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

Key shared types:
```ts
// socket.types.ts
export enum SocketEvents {
  // Client → Server
  JOIN_CHAT        = 'join_chat',
  LEAVE_CHAT       = 'leave_chat',
  SEND_MESSAGE     = 'send_message',
  TYPING_START     = 'typing_start',
  TYPING_STOP      = 'typing_stop',
  MARK_READ        = 'mark_read',
  // Server → Client
  NEW_MESSAGE      = 'new_message',
  MESSAGE_UPDATED  = 'message_updated',
  USER_TYPING      = 'user_typing',
  USER_ONLINE      = 'user_online',
  USER_OFFLINE     = 'user_offline',
  MESSAGES_READ    = 'messages_read',
  CHAT_UPDATED     = 'chat_updated',
}
```

### 1.3 Docker Compose

`docker-compose.yml`:
```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: whatsapp
      POSTGRES_PASSWORD: whatsapp
      POSTGRES_DB: whatsapp
    ports: ['5432:5432']
    volumes: ['pgdata:/var/lib/postgresql/data']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    volumes: ['redisdata:/data']

volumes:
  pgdata:
  redisdata:
```

Run: `docker-compose up -d`

### 1.4 NestJS App Bootstrap

```bash
cd apps
npx @nestjs/cli new api --package-manager pnpm --skip-git
cd api
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/platform-socket.io
pnpm add @nestjs/websockets socket.io
pnpm add @prisma/client ioredis passport passport-jwt passport-local bcryptjs
pnpm add class-validator class-transformer
pnpm add cloudinary multer @nestjs/multer
pnpm add -D prisma @types/bcryptjs @types/multer @types/passport-jwt
```

`apps/api/.env`:
```
DATABASE_URL="postgresql://whatsapp:whatsapp@localhost:5432/whatsapp"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET="your_access_secret_here"
JWT_REFRESH_SECRET="your_refresh_secret_here"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
CLIENT_URL="http://localhost:3000"
PORT=4000
```

### 1.5 Next.js App Bootstrap

```bash
cd apps
npx create-next-app@latest web --typescript --tailwind --app --skip-git --use-pnpm
cd web
pnpm add socket.io-client zustand @tanstack/react-query axios
pnpm add date-fns react-hook-form zod @hookform/resolvers
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-avatar
pnpm add @radix-ui/react-scroll-area @radix-ui/react-tooltip @radix-ui/react-popover
pnpm add lucide-react emoji-picker-react react-dropzone
pnpm add -D @types/node
```

`apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

---

## Phase 2 — Database Schema (Prisma)

`apps/api/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id @default(cuid())
  phone          String    @unique
  name           String
  about          String    @default("Hey there! I am using WhatsApp.")
  avatar         String?
  avatarPublicId String?
  lastSeen       DateTime?
  isOnline       Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  refreshTokens  RefreshToken[]
  chatMembers    ChatMember[]
  sentMessages   Message[]      @relation("SentMessages")
  readReceipts   ReadReceipt[]
  groupsCreated  Chat[]         @relation("GroupCreator")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

enum ChatType {
  DIRECT
  GROUP
}

model Chat {
  id          String     @id @default(cuid())
  type        ChatType   @default(DIRECT)
  name        String?                        // Group name
  avatar      String?                        // Group avatar
  avatarPublicId String?
  description String?                        // Group description
  createdById String?
  createdBy   User?      @relation("GroupCreator", fields: [createdById], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  members     ChatMember[]
  messages    Message[]
}

enum MemberRole {
  MEMBER
  ADMIN
}

model ChatMember {
  id       String     @id @default(cuid())
  chatId   String
  userId   String
  role     MemberRole @default(MEMBER)
  joinedAt DateTime   @default(now())

  chat     Chat       @relation(fields: [chatId], references: [id], onDelete: Cascade)
  user     User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([chatId, userId])
}

enum MessageType {
  TEXT
  IMAGE
  VIDEO
  AUDIO
  DOCUMENT
  STICKER
}

model Message {
  id          String      @id @default(cuid())
  chatId      String
  senderId    String
  type        MessageType @default(TEXT)
  content     String?                       // Text content
  mediaUrl    String?                       // File URL
  mediaPublicId String?
  fileName    String?                       // For documents
  replyToId   String?                       // For reply-to
  isDeleted   Boolean     @default(false)
  editedAt    DateTime?
  createdAt   DateTime    @default(now())

  chat        Chat        @relation(fields: [chatId], references: [id], onDelete: Cascade)
  sender      User        @relation("SentMessages", fields: [senderId], references: [id])
  replyTo     Message?    @relation("Replies", fields: [replyToId], references: [id])
  replies     Message[]   @relation("Replies")
  readReceipts ReadReceipt[]
}

model ReadReceipt {
  id        String   @id @default(cuid())
  messageId String
  userId    String
  readAt    DateTime @default(now())

  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([messageId, userId])
}
```

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

---

## Phase 3 — NestJS Backend

### 3.1 App Module Structure

```
apps/api/src/
├── main.ts
├── app.module.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── redis/
│   ├── redis.module.ts
│   └── redis.service.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── jwt-refresh.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt-refresh.guard.ts
│   └── dto/
│       ├── register.dto.ts
│       └── login.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/update-user.dto.ts
├── chats/
│   ├── chats.module.ts
│   ├── chats.controller.ts
│   ├── chats.service.ts
│   └── dto/
│       ├── create-chat.dto.ts
│       └── create-group.dto.ts
├── messages/
│   ├── messages.module.ts
│   ├── messages.controller.ts
│   ├── messages.service.ts
│   └── dto/create-message.dto.ts
├── upload/
│   ├── upload.module.ts
│   ├── upload.controller.ts
│   └── upload.service.ts
└── gateway/
    ├── gateway.module.ts
    └── chat.gateway.ts
```

### 3.2 main.ts

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 4000);
  console.log(`API running on port ${process.env.PORT ?? 4000}`);
}
bootstrap();
```

### 3.3 Prisma Service

```ts
// prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### 3.4 Redis Service

```ts
// redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public client: Redis;

  constructor(private config: ConfigService) {
    this.client = new Redis(this.config.get('REDIS_URL'));
  }

  async setOnline(userId: string, socketId: string) {
    await this.client.hset('online_users', userId, socketId);
  }

  async setOffline(userId: string) {
    await this.client.hdel('online_users', userId);
  }

  async isOnline(userId: string): Promise<boolean> {
    return !!(await this.client.hget('online_users', userId));
  }

  async getOnlineUsers(): Promise<string[]> {
    const map = await this.client.hgetall('online_users');
    return Object.keys(map || {});
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
```

### 3.5 Auth Module

**DTOs:**
```ts
// auth/dto/register.dto.ts
import { IsString, IsPhoneNumber, MinLength } from 'class-validator';

export class RegisterDto {
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// auth/dto/login.dto.ts
export class LoginDto {
  @IsPhoneNumber()
  phone: string;

  @IsString()
  password: string;
}
```

**Auth Service:**
```ts
// auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Phone already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { phone: dto.phone, name: dto.name, password: hashed },
      // Note: add password field to schema as String
    });

    return this.generateTokens(user.id, user.phone);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.phone);
  }

  async refresh(userId: string, refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!stored || stored.userId !== userId || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.generateTokens(user.id, user.phone);
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId, token: refreshToken },
    });
  }

  private async generateTokens(userId: string, phone: string) {
    const payload = { sub: userId, phone };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES'),
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken, userId };
  }
}
```

**Auth Controller:**
```ts
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }

  @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Request() req) {
    return this.auth.refresh(req.user.sub, req.body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req, @Body('refreshToken') rt: string) {
    return this.auth.logout(req.user.sub, rt);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req) { return req.user; }
}
```

> **Add `password String` field to User model in Prisma schema before running migrations.**

### 3.6 Users Module

```ts
// users/users.service.ts — key methods
async findById(id: string) {
  return this.prisma.user.findUnique({
    where: { id },
    select: { id:true, name:true, phone:true, about:true, avatar:true, isOnline:true, lastSeen:true },
  });
}

async search(query: string, excludeId: string) {
  return this.prisma.user.findMany({
    where: {
      AND: [
        { id: { not: excludeId } },
        { OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
        ]},
      ],
    },
    select: { id:true, name:true, phone:true, avatar:true, isOnline:true, lastSeen:true },
    take: 20,
  });
}

async updateProfile(userId: string, dto: UpdateUserDto) {
  return this.prisma.user.update({ where: { id: userId }, data: dto });
}
```

**Users Controller routes:**
- `GET /users/search?q=` — search users
- `GET /users/:id` — get user profile
- `PATCH /users/me` — update own profile

### 3.7 Chats Module

```ts
// chats/chats.service.ts — key methods

// Create or get direct chat between two users
async getOrCreateDirectChat(userId: string, targetUserId: string) {
  // Find existing direct chat shared by both users
  const existing = await this.prisma.chat.findFirst({
    where: {
      type: 'DIRECT',
      members: { every: { userId: { in: [userId, targetUserId] } } },
      AND: [
        { members: { some: { userId } } },
        { members: { some: { userId: targetUserId } } },
      ],
    },
    include: { members: { include: { user: true } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  if (existing) return existing;

  return this.prisma.chat.create({
    data: {
      type: 'DIRECT',
      members: {
        create: [{ userId }, { userId: targetUserId }],
      },
    },
    include: { members: { include: { user: true } } },
  });
}

// Create group chat
async createGroup(userId: string, dto: CreateGroupDto) {
  return this.prisma.chat.create({
    data: {
      type: 'GROUP',
      name: dto.name,
      description: dto.description,
      createdById: userId,
      members: {
        create: [
          { userId, role: 'ADMIN' },
          ...dto.memberIds.map(id => ({ userId: id, role: 'MEMBER' as const })),
        ],
      },
    },
    include: { members: { include: { user: true } } },
  });
}

// Get all chats for a user with last message + unread count
async getUserChats(userId: string) {
  const chats = await this.prisma.chat.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: { select: { id:true, name:true, avatar:true, isOnline:true, lastSeen:true } } } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { name:true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Compute unread counts per chat
  const withUnread = await Promise.all(chats.map(async chat => {
    const unread = await this.prisma.message.count({
      where: {
        chatId: chat.id,
        senderId: { not: userId },
        readReceipts: { none: { userId } },
      },
    });
    return { ...chat, unreadCount: unread };
  }));

  return withUnread;
}
```

**Chats Controller routes:**
- `GET /chats` — get user's chats
- `POST /chats/direct` — create/get direct chat `{ targetUserId }`
- `POST /chats/group` — create group `{ name, description, memberIds }`
- `GET /chats/:id` — get single chat with members
- `PATCH /chats/:id` — update group name/description (admin only)
- `POST /chats/:id/members` — add member to group
- `DELETE /chats/:id/members/:userId` — remove member from group
- `DELETE /chats/:id/leave` — leave group

### 3.8 Messages Module

```ts
// messages/messages.service.ts — key methods

async getChatMessages(chatId: string, userId: string, cursor?: string, limit = 30) {
  // Verify user is member
  const isMember = await this.prisma.chatMember.findUnique({
    where: { chatId_userId: { chatId, userId } },
  });
  if (!isMember) throw new ForbiddenException();

  const messages = await this.prisma.message.findMany({
    where: { chatId, isDeleted: false },
    include: {
      sender: { select: { id:true, name:true, avatar:true } },
      replyTo: { include: { sender: { select: { name:true } } } },
      readReceipts: { select: { userId:true, readAt:true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = messages.length > limit;
  return {
    messages: messages.slice(0, limit).reverse(),
    hasMore,
    nextCursor: hasMore ? messages[limit - 1].id : null,
  };
}

async createMessage(chatId: string, senderId: string, dto: CreateMessageDto) {
  const message = await this.prisma.message.create({
    data: {
      chatId,
      senderId,
      type: dto.type ?? 'TEXT',
      content: dto.content,
      mediaUrl: dto.mediaUrl,
      fileName: dto.fileName,
      replyToId: dto.replyToId,
    },
    include: {
      sender: { select: { id:true, name:true, avatar:true } },
      replyTo: { include: { sender: { select: { name:true } } } },
    },
  });

  // Update chat updatedAt for ordering
  await this.prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });

  return message;
}

async markAsRead(chatId: string, userId: string) {
  // Get all unread messages in chat
  const unread = await this.prisma.message.findMany({
    where: {
      chatId,
      senderId: { not: userId },
      readReceipts: { none: { userId } },
    },
    select: { id: true },
  });

  if (!unread.length) return;

  await this.prisma.readReceipt.createMany({
    data: unread.map(m => ({ messageId: m.id, userId })),
    skipDuplicates: true,
  });

  return unread.map(m => m.id);
}

async deleteMessage(messageId: string, userId: string) {
  const message = await this.prisma.message.findUnique({ where: { id: messageId } });
  if (!message || message.senderId !== userId) throw new ForbiddenException();
  return this.prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true, content: null },
  });
}
```

**Messages Controller routes:**
- `GET /messages/:chatId?cursor=&limit=` — paginated messages
- `DELETE /messages/:id` — delete message (soft)

### 3.9 Upload Module

```ts
// upload/upload.service.ts
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key:    config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(buffer: Buffer, folder: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(buffer);
    });
  }

  async deleteFile(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}
```

**Upload Controller routes:**
- `POST /upload/avatar` — upload user/group avatar (multipart, max 5MB image)
- `POST /upload/media` — upload chat media (image/video/document, max 64MB)

Returns `{ url, publicId }`.

### 3.10 Socket.IO Gateway

```ts
// gateway/chat.gateway.ts
@WebSocketGateway({ cors: { origin: process.env.CLIENT_URL, credentials: true } })
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private messages: MessagesService,
    private chats: ChatsService,
    private redis: RedisService,
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ── Connection ──────────────────────────────────────────────
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string;
      const payload = this.jwt.verify(token, { secret: this.config.get('JWT_ACCESS_SECRET') });
      client.data.userId = payload.sub;

      await this.redis.setOnline(payload.sub, client.id);
      await this.prisma.user.update({ where: { id: payload.sub }, data: { isOnline: true } });

      // Auto-join all user's chat rooms
      const chats = await this.prisma.chatMember.findMany({ where: { userId: payload.sub } });
      for (const c of chats) client.join(c.chatId);

      // Broadcast online status to contacts
      this.server.emit(SocketEvents.USER_ONLINE, { userId: payload.sub });
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.redis.setOffline(userId);
    const lastSeen = new Date();
    await this.prisma.user.update({ where: { id: userId }, data: { isOnline: false, lastSeen } });

    this.server.emit(SocketEvents.USER_OFFLINE, { userId, lastSeen });
  }

  // ── Events ──────────────────────────────────────────────────
  @SubscribeMessage(SocketEvents.JOIN_CHAT)
  async handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    client.join(data.chatId);
  }

  @SubscribeMessage(SocketEvents.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; content?: string; type?: string; mediaUrl?: string; fileName?: string; replyToId?: string },
  ) {
    const userId = client.data.userId;
    const message = await this.messages.createMessage(data.chatId, userId, data);

    // Emit to all room members
    this.server.to(data.chatId).emit(SocketEvents.NEW_MESSAGE, message);

    // Update chat list for all members
    this.server.to(data.chatId).emit(SocketEvents.CHAT_UPDATED, { chatId: data.chatId });
  }

  @SubscribeMessage(SocketEvents.TYPING_START)
  handleTypingStart(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    client.to(data.chatId).emit(SocketEvents.USER_TYPING, {
      chatId: data.chatId,
      userId: client.data.userId,
      isTyping: true,
    });
  }

  @SubscribeMessage(SocketEvents.TYPING_STOP)
  handleTypingStop(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    client.to(data.chatId).emit(SocketEvents.USER_TYPING, {
      chatId: data.chatId,
      userId: client.data.userId,
      isTyping: false,
    });
  }

  @SubscribeMessage(SocketEvents.MARK_READ)
  async handleMarkRead(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    const userId = client.data.userId;
    const readMessageIds = await this.messages.markAsRead(data.chatId, userId);
    if (readMessageIds?.length) {
      this.server.to(data.chatId).emit(SocketEvents.MESSAGES_READ, {
        chatId: data.chatId,
        userId,
        messageIds: readMessageIds,
      });
    }
  }
}
```

**WsJwtGuard:** Extracts `token` from `client.handshake.auth.token`, verifies JWT, attaches user to `client.data`.

---

## Phase 4 — Next.js Frontend

### 4.1 App Structure

```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   └── layout.tsx            # Main app shell (sidebar + outlet)
│   │   └── page.tsx              # Redirect or empty state
│   │   └── chat/
│   │       └── [chatId]/page.tsx # Chat view
│   └── layout.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── ChatList.tsx
│   │   ├── ChatListItem.tsx
│   │   ├── SearchBar.tsx
│   │   └── NewChatModal.tsx
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ReplyPreview.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── MediaMessage.tsx
│   ├── modals/
│   │   ├── NewGroupModal.tsx
│   │   ├── GroupInfoModal.tsx
│   │   ├── ContactInfoModal.tsx
│   │   └── ProfileModal.tsx
│   └── ui/                       # shadcn/ui + custom primitives
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       └── Tick.tsx
├── hooks/
│   ├── useSocket.ts
│   ├── useAuth.ts
│   ├── useChats.ts
│   ├── useMessages.ts
│   └── useTyping.ts
├── stores/
│   ├── authStore.ts
│   ├── chatStore.ts
│   └── socketStore.ts
├── lib/
│   ├── api.ts                    # Axios instance
│   └── socket.ts                 # Socket.IO singleton
└── types/
    └── index.ts
```

### 4.2 Zustand Stores

```ts
// stores/authStore.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      updateUser: (u) => set(s => ({ user: s.user ? { ...s.user, ...u } : null })),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
);

// stores/chatStore.ts
interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  typingUsers: Record<string, string[]>;  // chatId → userId[]
  setChats: (chats: Chat[]) => void;
  upsertChat: (chat: Chat) => void;
  setActiveChat: (id: string | null) => void;
  setTyping: (chatId: string, userId: string, typing: boolean) => void;
  updateLastMessage: (chatId: string, message: Message) => void;
}
```

### 4.3 Axios Instance & Token Refresh

```ts
// lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { refreshToken } = useAuthStore.getState();
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          { refreshToken }
        );
        useAuthStore.getState().setAuth(useAuthStore.getState().user!, data.accessToken, data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
```

### 4.4 Socket Singleton

```ts
// lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
```

### 4.5 useSocket Hook

```ts
// hooks/useSocket.ts
export function useSocket() {
  const { accessToken, user } = useAuthStore();
  const { upsertChat, setTyping, updateLastMessage } = useChatStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken || !user) return;

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    socket.on(SocketEvents.NEW_MESSAGE, (message: Message) => {
      queryClient.setQueryData(['messages', message.chatId], (old: any) => ({
        ...old,
        pages: old?.pages?.map((p: any, i: number) =>
          i === old.pages.length - 1 ? { ...p, messages: [...p.messages, message] } : p
        ) ?? [{ messages: [message], hasMore: false, nextCursor: null }],
      }));
      updateLastMessage(message.chatId, message);
    });

    socket.on(SocketEvents.USER_TYPING, ({ chatId, userId, isTyping }) => {
      setTyping(chatId, userId, isTyping);
    });

    socket.on(SocketEvents.USER_ONLINE, ({ userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    });

    socket.on(SocketEvents.USER_OFFLINE, ({ userId, lastSeen }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    });

    socket.on(SocketEvents.MESSAGES_READ, ({ chatId, messageIds }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    });

    socket.on(SocketEvents.CHAT_UPDATED, ({ chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    });

    return () => {
      socket.off(SocketEvents.NEW_MESSAGE);
      socket.off(SocketEvents.USER_TYPING);
      socket.off(SocketEvents.USER_ONLINE);
      socket.off(SocketEvents.USER_OFFLINE);
      socket.off(SocketEvents.MESSAGES_READ);
      socket.off(SocketEvents.CHAT_UPDATED);
    };
  }, [accessToken, user]);

  return socketRef.current;
}
```

### 4.6 App Layout (WhatsApp Shell)

```tsx
// app/(app)/layout.tsx
// WhatsApp 2-panel layout: fixed sidebar left + flex chat area right

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-wa-bg-dark">
      {/* Left panel — 30% width, min 360px */}
      <div className="flex flex-col w-[30%] min-w-[360px] max-w-[480px] border-r border-[#2A3942]">
        <Sidebar />
      </div>
      {/* Right panel — remaining width */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
```

### 4.7 Sidebar Component

```tsx
// components/sidebar/Sidebar.tsx
// Tabs: Chats | Status (placeholder) | Communities (placeholder)
// Header: Avatar, search icon, menu (new group, new chat, profile)

export function Sidebar() {
  const [tab, setTab] = useState<'chats'>('chats');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);

  return (
    <div className="flex flex-col h-full bg-wa-panel-dark">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#202C33]">
        <UserAvatar />
        <div className="flex gap-3 text-wa-icon">
          <IconButton icon={<CircleDotIcon />} title="Status" />
          <IconButton icon={<UsersIcon />} title="New group" onClick={() => setShowNewGroup(true)} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton icon={<EllipsisVerticalIcon />} title="Menu" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowNewGroup(true)}>New group</DropdownMenuItem>
              <DropdownMenuItem>Starred messages</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-wa-panel-dark">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery ? <UserSearchResults query={searchQuery} /> : <ChatList />}
      </div>

      {showNewGroup && <NewGroupModal onClose={() => setShowNewGroup(false)} />}
    </div>
  );
}
```

### 4.8 ChatListItem Component

```tsx
// components/sidebar/ChatListItem.tsx
// Mimics WhatsApp chat row:
// [Avatar] [Name + last message] [Time + unread badge]

interface Props { chat: ChatWithMeta; isActive: boolean; onClick: () => void; }

export function ChatListItem({ chat, isActive, onClick }: Props) {
  const { user } = useAuthStore();
  const lastMsg = chat.messages[0];
  const other = chat.type === 'DIRECT'
    ? chat.members.find(m => m.userId !== user?.id)?.user
    : null;

  const displayName = chat.type === 'GROUP' ? chat.name : other?.name;
  const avatar = chat.type === 'GROUP' ? chat.avatar : other?.avatar;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center px-3 py-3 cursor-pointer hover:bg-[#2A3942] transition-colors',
        isActive && 'bg-[#2A3942]'
      )}
    >
      <Avatar src={avatar} name={displayName} size={48} online={other?.isOnline} />
      <div className="flex-1 ml-3 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className="text-white font-medium text-sm truncate">{displayName}</span>
          <span className="text-wa-text-meta text-[11px] ml-2 shrink-0">
            {lastMsg ? formatTime(lastMsg.createdAt) : ''}
          </span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span className="text-wa-text-secondary text-xs truncate">
            {lastMsg?.isDeleted
              ? 'This message was deleted'
              : lastMsg?.type === 'IMAGE' ? '📷 Photo'
              : lastMsg?.type === 'VIDEO' ? '🎥 Video'
              : lastMsg?.content ?? ''}
          </span>
          {chat.unreadCount > 0 && (
            <span className="ml-2 shrink-0 bg-wa-green text-white text-[11px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 4.9 MessageBubble Component

```tsx
// components/chat/MessageBubble.tsx
// Outgoing: right-aligned, wa-bubble-out-dark bg, tail right
// Incoming: left-aligned, wa-bubble-in-dark bg, tail left

export function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start', 'mb-1 px-4')}>
      <div
        className={cn(
          'relative max-w-[65%] rounded-lg px-3 py-2 shadow-sm',
          isOwn ? 'bg-wa-bubble-out-dark rounded-tr-none' : 'bg-wa-bubble-in-dark rounded-tl-none',
        )}
      >
        {/* Reply preview */}
        {message.replyTo && <ReplyPreview reply={message.replyTo} />}

        {/* Group sender name */}
        {!isOwn && message.chat?.type === 'GROUP' && (
          <span className="text-xs font-medium text-wa-green block mb-1">{message.sender.name}</span>
        )}

        {/* Content */}
        {message.isDeleted ? (
          <span className="text-wa-text-meta italic text-sm">🚫 This message was deleted</span>
        ) : message.type === 'TEXT' ? (
          <p className="text-white text-sm whitespace-pre-wrap break-words">{message.content}</p>
        ) : message.type === 'IMAGE' ? (
          <img src={message.mediaUrl} className="rounded max-w-full max-h-64 object-cover" />
        ) : (
          <MediaMessage message={message} />
        )}

        {/* Meta: time + ticks */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[11px] text-wa-text-meta">{format(new Date(message.createdAt), 'HH:mm')}</span>
          {isOwn && <TickIcon message={message} />}
        </div>
      </div>
    </div>
  );
}
```

### 4.10 MessageInput Component

```tsx
// components/chat/MessageInput.tsx
export function MessageInput({ chatId }: { chatId: string }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const socket = useSocket();
  const { replyTo, clearReply } = useChatStore();
  const typingTimeout = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTyping = () => {
    socket?.emit(SocketEvents.TYPING_START, { chatId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit(SocketEvents.TYPING_STOP, { chatId });
    }, 1500);
  };

  const sendMessage = () => {
    if (!text.trim() && !replyTo) return;
    socket?.emit(SocketEvents.SEND_MESSAGE, {
      chatId,
      content: text.trim(),
      type: 'TEXT',
      replyToId: replyTo?.id,
    });
    setText('');
    clearReply();
    setShowEmoji(false);
  };

  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/upload/media', formData);
    const type = file.type.startsWith('image/') ? 'IMAGE'
                : file.type.startsWith('video/') ? 'VIDEO'
                : 'DOCUMENT';
    socket?.emit(SocketEvents.SEND_MESSAGE, {
      chatId, type, mediaUrl: data.url, fileName: file.name,
    });
  };

  return (
    <div className="flex flex-col bg-[#202C33]">
      {replyTo && <ReplyPreview reply={replyTo} onClose={clearReply} />}
      <div className="flex items-end px-3 py-2 gap-2">
        {/* Emoji button */}
        <IconButton icon={<SmileIcon />} onClick={() => setShowEmoji(!showEmoji)} />
        {/* Attach file */}
        <IconButton icon={<PaperclipIcon />} onClick={() => fileInputRef.current?.click()} />
        <input ref={fileInputRef} type="file" hidden accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {/* Text input */}
        <div className="flex-1 bg-[#2A3942] rounded-lg px-4 py-2">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); handleTyping(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a message"
            rows={1}
            className="w-full bg-transparent text-white text-sm resize-none outline-none placeholder-wa-text-secondary max-h-32"
          />
        </div>
        {/* Send / mic button */}
        <IconButton
          icon={text.trim() ? <SendIcon className="text-wa-green" /> : <MicIcon />}
          onClick={text.trim() ? sendMessage : undefined}
          className="bg-wa-green rounded-full p-2"
        />
      </div>
      {showEmoji && (
        <div className="absolute bottom-20 left-0 z-50">
          <EmojiPicker onEmojiClick={(e) => setText(t => t + e.emoji)} theme="dark" />
        </div>
      )}
    </div>
  );
}
```

### 4.11 Auth Pages

**Login (`/login`):**
- Phone + password form
- On success: store tokens + user, redirect to `/`

**Register (`/register`):**
- Name + phone + password form
- On success: same as login

Both pages: redirect to `/` if already authenticated.

**Auth guard:** Middleware in `middleware.ts` protecting `/(app)` routes.

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Read from cookie set during login for SSR-safe auth check
  const token = req.cookies.get('access_token')?.value;
  const isAuth = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');

  if (!token && !isAuth) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (token && isAuth) {
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = { matcher: ['/((?!_next|favicon|api).*)'] };
```

---

## Phase 5 — Key UI Flows

### 5.1 Start Direct Chat Flow
1. User clicks compose/search icon → `NewChatModal` opens
2. Debounced search calls `GET /users/search?q=` → shows contact list
3. User clicks a contact → `POST /chats/direct { targetUserId }`
4. Response chat returned → `upsertChat` in store, navigate to `/chat/[chatId]`
5. Socket `join_chat` emitted automatically on connection

### 5.2 Create Group Flow
1. `NewGroupModal` → step 1: search & select members (multi-select)
2. Step 2: group name + optional avatar upload
3. `POST /chats/group { name, memberIds }` → navigate to chat
4. If avatar: `POST /upload/avatar` first, then include URL in group creation

### 5.3 Message Loading (Infinite Scroll)
1. `useInfiniteQuery(['messages', chatId], fetchMessages)` with cursor pagination
2. On mount: scroll to bottom
3. `IntersectionObserver` on first message → `fetchNextPage` for older messages
4. Scroll stays pinned to bottom for new messages (unless user scrolled up)

### 5.4 Read Receipts
1. When `ChatWindow` mounts or tab is focused → emit `MARK_READ { chatId }`
2. Server creates `ReadReceipt` rows for all unread messages
3. Server broadcasts `MESSAGES_READ` to room
4. Client updates message `readReceipts` → render double blue tick

### 5.5 Typing Indicator
1. `MessageInput` emits `TYPING_START` on keystroke, `TYPING_STOP` after 1.5s idle
2. Server relays to room (excluding sender)
3. `TypingIndicator` component shows "John is typing..." or "John, Jane are typing..."

---

## Phase 6 — Group Features

### Group Info Panel (right drawer)
- Group avatar + name (editable by admin)
- Description (editable by admin)
- Member list with role badges (Admin / Member)
- Admin actions: remove member, promote to admin
- "Leave group" button for all members
- "Delete group" for group creator

### Group Chat Header
- Tap opens Group Info Panel
- Shows member names preview: "John, Jane, Bob +3"
- Online indicator replaced by member count

---

## Phase 7 — Profile & Settings

### My Profile Modal
- Edit display name
- Edit "About" status
- Avatar upload (crop square → upload to Cloudinary → `PATCH /users/me`)
- Show phone number (read-only)

### Contact Info Modal
- Contact's avatar, name, about, phone
- "Start chat" button if no existing chat
- Block user (frontend only, mark in store)

---

## Phase 8 — Polish & Edge Cases

### Message Context Menu (right-click / long-press)
- Reply
- Copy text
- Delete (own messages only) → `DELETE /messages/:id`
- Forward (optional, Phase 2)

### Empty States
- No chats: "Click the compose icon to start a chat"
- No messages in chat: "No messages yet. Say hi!"
- Search no results: "No contacts found"

### Date Separators in Message List
- Show "Today", "Yesterday", or formatted date between message groups

### Online / Last Seen
- In direct chat header: "online" or "last seen today at 14:32"
- Uses `isOnline` from user query + Redis presence

### Notifications (basic)
- `Notification API` in browser for new messages when tab is not focused

---

## Phase 9 — Environment & Deployment Checklist

### Environment Variables Summary

**Backend (`apps/api/.env`):**
```
DATABASE_URL
REDIS_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLIENT_URL=http://localhost:3000
PORT=4000
```

**Frontend (`apps/web/.env.local`):**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### Development Start

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Run migrations
cd apps/api && npx prisma migrate dev

# 3. Start all apps
pnpm dev   # from repo root (Turborepo runs both)
```

### Production Deployment Notes
- **API**: Deploy on Railway / Render / EC2. Enable Redis via Upstash or Railway Redis addon.
- **Frontend**: Deploy on Vercel. Set env vars in project settings.
- **DB**: Use Supabase, Neon, or Railway PostgreSQL.
- **CORS**: Update `CLIENT_URL` in API env to production frontend URL.
- **Socket.IO**: Ensure sticky sessions or use Redis adapter (`@socket.io/redis-adapter`) for multi-instance.

---

## Feature Checklist

- [x] Phone + password authentication (register / login / logout)
- [x] JWT access + refresh token rotation
- [x] User profile (name, about, avatar)
- [x] User search by name / phone
- [x] 1-on-1 direct chat
- [x] Group chat (create, add/remove members, admin roles)
- [x] Real-time messaging via Socket.IO
- [x] Typing indicators
- [x] Online / offline presence
- [x] Last seen timestamps
- [x] Message read receipts (single ✓ / double ✓ / blue ✓✓)
- [x] Unread message count badges
- [x] Reply-to message
- [x] Image / video / document upload via Cloudinary
- [x] Soft delete messages
- [x] Infinite scroll message pagination (cursor-based)
- [x] WhatsApp dark mode design system (exact color tokens)
- [x] Emoji picker
- [x] Date separators in message list
- [x] Group info panel
- [x] Contact info panel
- [x] Protected routes with JWT middleware

---

*End of build plan. Each phase is self-contained and ordered for sequential execution by an AI agent.*