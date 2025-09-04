# Church SaaS - Staff Events & Locations Implementation

This repository contains the complete, functional implementations of the **Staff Events** and **Event Locations** pages to replace the "Coming Soon" placeholders in your Church Management SaaS.

## ✅ What's Included

### 🗄️ Database Integration
- **Direct integration** with your existing Supabase database
- **Uses your actual church data**: `church_id: 'be182854-02b4-43b6-9123-3229daabea7d'`
- **Pre-configured for your tables**: `church_locations`, `staff_event_categories`, `events`, `location_bookings`

### 📱 Fully Functional Pages

#### 1. Staff Events (`/dashboard/events/staff/page.tsx`)
- **Complete event management** - Create, view, edit staff events
- **Privacy controls** - Staff Only, Leadership Only, HR Only, Admin Only
- **Category system** - Uses your existing staff event categories
- **Location booking** - Integrates with church locations
- **Search & filtering** - Find events by status, category, search terms
- **Approval workflows** - Optional approval system for sensitive events

#### 2. Event Locations (`/dashboard/events/locations/page.tsx`) 
- **Location management** - View, create, edit church facilities
- **Equipment tracking** - Manage available equipment per location
- **Booking calendar** - See upcoming bookings for each location
- **Usage analytics** - Track utilization and optimization insights
- **Conflict detection** - Prevent double-booking with setup/cleanup buffers

## 🚀 Quick Implementation

### Step 1: Copy the Files
Copy these files to your existing Next.js project:

```bash
src/
├── app/dashboard/events/
│   ├── staff/
│   │   └── page.tsx           # Replace your "Coming Soon" page
│   └── locations/
│       └── page.tsx           # Replace your "Coming Soon" page
└── lib/
    └── supabase.ts            # Supabase client (if you don't have one)
```

### Step 2: Environment Setup
Create `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 3: Install Dependencies
```bash
npm install @supabase/supabase-js lucide-react
```

### Step 4: Update Church ID
In both page files, update the `churchId` constant with your actual church ID:

```typescript
// Replace this line in both files:
const churchId = 'be182854-02b4-43b6-9123-3229daabea7d'
// With your actual church ID from the database
```

## 🎯 Features Overview

### Staff Events Features
- ✅ **Privacy Levels**: Staff Only, Leadership Only, HR Only, Admin Only
- ✅ **Event Categories**: Uses your existing staff event categories (Staff Meetings, Leadership Retreat, Training, HR, Board Meetings)
- ✅ **Location Integration**: Select from your church locations
- ✅ **Approval System**: Optional approval workflow
- ✅ **Search & Filter**: By status, category, and search terms
- ✅ **Contact Management**: Track event organizers
- ✅ **Responsive Design**: Works on all devices

### Event Locations Features  
- ✅ **Location Types**: Worship Space, Meeting Room, Fellowship Area, Office, Outdoor Area, Utility Space
- ✅ **Equipment Tracking**: Manage available equipment per location
- ✅ **Capacity Management**: Track room capacity and usage
- ✅ **Booking System**: View upcoming bookings and conflicts
- ✅ **Usage Analytics**: Track utilization percentages and trends
- ✅ **Setup/Cleanup Buffers**: Prevent conflicts with time buffers
- ✅ **Approval Controls**: Some locations require approval for booking

## 🗃️ Database Schema

The implementation uses your existing database tables:

### church_locations
- Complete location management with capacity, equipment, booking rules
- 6 sample locations already populated in your database

### staff_event_categories  
- 5 categories with different access levels (Staff/Leadership/HR/Admin)
- Color coding and icons for organization

### events
- Staff events stored with `event_type = 'staff'` and `unified_type = 'staff'`
- Privacy controls via `visibility_level` field

### location_bookings
- Automatic booking creation when events are scheduled
- Conflict detection and approval workflows

## 🎨 UI Components

The pages use these shadcn/ui components:
- `Button`, `Card`, `Dialog`, `Input`, `Label`, `Textarea`
- `Select`, `Badge`, `Tabs`, `Alert`
- Lucide React icons for consistent iconography

## 🔧 Customization

### Update Church ID
Find and replace the `churchId` constant in both files with your actual church ID from the database.

### Modify Categories
The staff event categories are loaded from your database. You can add/edit categories directly in the `staff_event_categories` table.

### Adjust Permissions
Update the `canViewEvent()` function in the Staff Events page to match your authentication system.

### Styling
The pages use Tailwind CSS classes and can be customized by modifying the className props.

## 🚦 Current Status

Your Supabase database is already set up with:
- ✅ 6 church locations with sample data
- ✅ 5 staff event categories with access levels  
- ✅ Location booking system with conflict detection
- ✅ Sample events and bookings

## 🎯 Result

After implementing these pages, you'll have:

1. **Professional Staff Events management** - Replace "Coming Soon" with full functionality
2. **Complete Locations management** - Facility booking and analytics  
3. **Database integration** - Uses your actual church data
4. **Modern UI** - Professional interface matching your existing design
5. **Mobile responsive** - Works on all devices

Both pages are production-ready and will seamlessly integrate with your existing Church Management SaaS platform.

## 📞 Support

If you need help implementing these pages, the code is well-documented with TypeScript interfaces and clear component structure. The database integration is already configured for your specific Supabase setup.

---

**Ready to replace those "Coming Soon" placeholders with fully functional church management tools!** 🎉