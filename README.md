# Testjuhitud Arendus - Task Management System

## Domeenikirjeldus

See projekt on Task Management System (Ülesannete Haldussüsteem), mis võimaldab kasutajatel hallata oma ülesandeid. Süsteem toetab ülesannete loomist, staatuse muutmist ja üle aja läinud ülesannete leidmist.

### Põhifunktsionaalsused

1. **Ülesande loomine** - Kasutajad saavad luua uusi ülesandeid pealkirja, kirjelduse, prioriteedi ja tähtaegaga
2. **Ülesande staatuse muutmine** - Ülesandeid saab uuendada erinevate staatustega (ootel, tegemisel, valmis, tühistatud)
3. **Üle aja läinud ülesannete leidmine** - Süsteem leiab kõik ülesanded, mille tähtaeg on möödunud ja mis pole valmis või tühistatud

### Ärireeglid

- Ülesannet saab luua ainult kui kasutaja eksisteerib ja pealkiri ei ole tühi
- Ülesande staatust saab muuta ainult kehtivate väärtustega
- Valmis ülesannet ei saa muuta tagasi ootel staatuseks
- Üle aja läinud ülesanded on need, mille tähtaeg on möödunud ja mis pole valmis või tühistatud

## Tehniline Stack

- **Keel**: TypeScript
- **Testimine**: Jest
- **ORM**: Prisma
- **Andmebaas**: SQLite (arenduseks)
- **Mockimine**: Jest mocks

## Seadistamine

### Eeltingimused

- Node.js (versioon 18 või uuem)
- npm

### Installimine

1. Klooni repositoorium:
```bash
git clone <repository-url>
cd testjuhitud-arendus
```

2. Installi sõltuvused:
```bash
npm install
```

3. Kopeeri keskkonna fail:
```bash
cp env.example .env
```

4. Genereeri Prisma klient:
```bash
npm run db:generate
```

5. Käivita migratsioonid:
```bash
npm run db:migrate
```

## Käivitamine

### Arendusrežiim
```bash
npm run dev
```

### Testide käivitamine
```bash
# Kõik testid
npm test

# Testide käivitamine jälgimise režiimis
npm run test:watch

# Testide katvuse raport
npm run test:coverage
```

### Andmebaas

```bash
# Migratsioonide käivitamine
npm run db:migrate

# Andmebaasi lähtestamine
npm run db:reset

# Prisma klientide genereerimine
npm run db:generate
```

## Testide struktuur

Projekt kasutab Test-Driven Development (TDD) lähenemist:

### Testide nimetused
- `peab <käitumine> kui <tingimus>` - kirjeldab oodatud käitumist
- Näited:
  - `peab looma ülesande kui kasutaja eksisteerib ja pealkiri on olemas`
  - `peab viskama vea kui kasutaja ei eksisteeri`
  - `peab uuendama ülesande staatust kui uus staatus on kehtiv`

### Mockimine
- Prisma klient on mockitud kõigis testides
- Kuupäev on fikseeritud testides (`2024-01-15T10:00:00Z`)
- UUID-d on mockitud deterministlike väärtustega

## Andmebaasi skeem

### Tabelid

#### Users
- `id` (String, Primary Key)
- `email` (String, Unique)
- `name` (String)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

#### Tasks
- `id` (String, Primary Key)
- `title` (String)
- `description` (String, Optional)
- `status` (String) - PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- `priority` (String) - LOW, MEDIUM, HIGH, URGENT
- `dueDate` (DateTime, Optional)
- `userId` (String, Foreign Key)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

#### Comments
- `id` (String, Primary Key)
- `content` (String)
- `taskId` (String, Foreign Key)
- `userId` (String, Foreign Key)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## API näited

### TaskService

```typescript
import { TaskService } from './services/TaskService';

const taskService = new TaskService();

// Ülesande loomine
const task = await taskService.createTask({
  title: 'Uus ülesanne',
  description: 'Kirjeldus',
  priority: Priority.HIGH,
  userId: 'user-123'
});

// Ülesande staatuse muutmine
const updatedTask = await taskService.updateTaskStatus('task-123', TaskStatus.IN_PROGRESS);

// Üle aja läinud ülesannete leidmine
const overdueTasks = await taskService.getOverdueTasks();
```

## Testide katvus

- **Üldine katvus**: 88.88%
- **Statements**: 88.88%
- **Branches**: 77.77%
- **Functions**: 100%
- **Lines**: 88.88%

## Git töövoog

Projekt kasutab feature branch töövoogu:

1. Iga funktsionaalsus on eraldi feature branchis
2. TDD tsükkel: red → green → refactor
3. Merge main branchi merge commit'iga
4. Feature branchid jäetakse alles ajaloo jaoks

## Litsents

MIT
