'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Building,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Briefcase
} from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client - replace with your actual values
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface StaffEvent {
  id: string
  title: string
  description: string | null
  event_type: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  location_name: string | null
  room_id: string | null
  visibility_level: 'staff_only' | 'leadership_only' | 'hr_only' | 'admin_only'
  status: 'draft' | 'confirmed' | 'cancelled'
  approval_required: boolean
  approved_by: string | null
  approved_at: string | null
  contact_name: string | null
  contact_email: string | null
  notes: string | null
  category_id: string | null
  created_by: string
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
    color: string
    icon: string
    access_level: string
  }
  room?: {
    id: string
    name: string
  }
}

interface StaffEventCategory {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  access_level: 'staff_only' | 'leadership_only' | 'hr_only' | 'admin_only'
  is_confidential: boolean
  sort_order: number
}

interface Location {
  id: string
  name: string
  location_type: string
  capacity: number | null
}

export default function StaffEventsPage() {
  const [events, setEvents] = useState<StaffEvent[]>([])
  const [categories, setCategories] = useState<StaffEventCategory[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<StaffEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [currentUserRole, setCurrentUserRole] = useState<string>('admin') // This should come from auth context
  
  // Use the church_id from your database
  const churchId = 'be182854-02b4-43b6-9123-3229daabea7d'

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location_name: '',
    room_id: '',
    category_id: '',
    visibility_level: 'staff_only',
    contact_name: '',
    contact_email: '',
    notes: '',
    approval_required: false
  })

  const visibilityLevels = [
    { value: 'staff_only', label: 'All Staff', icon: '👥', description: 'Visible to all staff members' },
    { value: 'leadership_only', label: 'Leadership Only', icon: '👑', description: 'Visible to leadership team only' },
    { value: 'hr_only', label: 'HR Only', icon: '🔒', description: 'Visible to HR personnel only' },
    { value: 'admin_only', label: 'Admin Only', icon: '⚡', description: 'Visible to administrators only' }
  ]

  const eventStatuses = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'confirmed', label: 'Confirmed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ]

  // Fetch staff events
  const fetchStaffEvents = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          category:staff_event_categories!inner(id, name, color, icon, access_level),
          room:church_locations(id, name)
        `)
        .eq('church_id', churchId)
        .eq('event_type', 'staff')
        .order('start_date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching staff events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch staff event categories
  const fetchStaffEventCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_event_categories')
        .select('*')
        .eq('church_id', churchId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('church_locations')
        .select('id, name, location_type, capacity')
        .eq('church_id', churchId)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setLocations(data || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  useEffect(() => {
    fetchStaffEvents()
    fetchStaffEventCategories()
    fetchLocations()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const eventData = {
        church_id: churchId,
        title: formData.title,
        description: formData.description || null,
        event_type: 'staff',
        unified_type: 'staff',
        start_date: formData.start_date,
        end_date: formData.end_date || formData.start_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location_name: formData.location_name,
        room_id: formData.room_id || null,
        category_id: formData.category_id || null,
        visibility_level: formData.visibility_level,
        is_public: false, // Staff events are never public
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        notes: formData.notes || null,
        approval_required: formData.approval_required,
        status: 'confirmed',
        created_by: 'current-user-id' // This should come from auth context
      }

      const { error } = await supabase
        .from('events')
        .insert([eventData])

      if (error) throw error

      // Reset form and refresh data
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        location_name: '',
        room_id: '',
        category_id: '',
        visibility_level: 'staff_only',
        contact_name: '',
        contact_email: '',
        notes: '',
        approval_required: false
      })
      setIsDialogOpen(false)
      fetchStaffEvents()
    } catch (error) {
      console.error('Error creating staff event:', error)
      // You can add toast notification here
    }
  }

  // Check if user can view an event based on visibility level
  const canViewEvent = (event: StaffEvent) => {
    switch (event.visibility_level) {
      case 'admin_only':
        return currentUserRole === 'admin'
      case 'hr_only':
        return ['admin', 'hr'].includes(currentUserRole)
      case 'leadership_only':
        return ['admin', 'hr', 'leadership'].includes(currentUserRole)
      case 'staff_only':
      default:
        return true
    }
  }

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    if (!canViewEvent(event)) return false
    
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus
    const matchesCategory = filterCategory === 'all' || event.category_id === filterCategory
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getVisibilityInfo = (level: string) => {
    return visibilityLevels.find(v => v.value === level) || visibilityLevels[0]
  }

  const getStatusColor = (status: string) => {
    const statusObj = eventStatuses.find(s => s.value === status)
    return statusObj?.color || 'gray'
  }

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`)
    return {
      date: dateTime.toLocaleDateString(),
      time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-orange-500" />
            Staff Events
          </h1>
          <p className="text-gray-600 mt-1">
            Manage staff meetings, planning sessions, training events, and internal church activities
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Staff Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Staff Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Weekly Staff Meeting"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Agenda: Review ministry activities, discuss upcoming events..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category_id">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            <span style={{ color: category.color }}>●</span>
                            {category.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="visibility_level">Visibility Level *</Label>
                  <Select
                    value={formData.visibility_level}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, visibility_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <span className="flex items-center gap-2">
                            <span>{level.icon}</span>
                            <div>
                              <div>{level.label}</div>
                              <div className="text-xs text-gray-500">{level.description}</div>
                            </div>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    placeholder="Same as start date if not set"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location_name">Location Name</Label>
                  <Input
                    id="location_name"
                    value={formData.location_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                    placeholder="Conference Room"
                  />
                </div>
                <div>
                  <Label htmlFor="room_id">Church Location</Label>
                  <Select
                    value={formData.room_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, room_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          <span className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <div>
                              <div>{location.name}</div>
                              {location.capacity && (
                                <div className="text-xs text-gray-500">Capacity: {location.capacity}</div>
                              )}
                            </div>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Contact Person</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="john@church.org"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Additional notes for staff..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="approval_required"
                  checked={formData.approval_required}
                  onChange={(e) => setFormData(prev => ({ ...prev, approval_required: e.target.checked }))}
                />
                <Label htmlFor="approval_required">Requires approval before confirming</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Schedule Event
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search staff events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {eventStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span style={{ color: category.color }}>●</span>
                        {category.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            {events.length === 0 
              ? "No staff events scheduled yet. Create your first staff event to get started."
              : "No staff events match your current filters."
            }
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const startDateTime = formatDateTime(event.start_date, event.start_time)
            const endDateTime = formatDateTime(event.end_date || event.start_date, event.end_time)
            const visibilityInfo = getVisibilityInfo(event.visibility_level)
            const statusColor = getStatusColor(event.status)
            
            return (
              <Card 
                key={event.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedEvent(event)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="text-lg leading-tight">{event.title}</span>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant={statusColor === 'green' ? 'default' : statusColor === 'red' ? 'destructive' : 'secondary'}
                      >
                        {event.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {event.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{visibilityInfo.icon}</span>
                    <span>{visibilityInfo.label}</span>
                    {event.approval_required && !event.approved_at && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 ml-auto" title="Requires approval" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {startDateTime.date}
                        {event.end_date && event.end_date !== event.start_date && 
                          ` - ${endDateTime.date}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{startDateTime.time} - {endDateTime.time}</span>
                    </div>
                    {event.location_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>{event.location_name}</span>
                      </div>
                    )}
                  </div>

                  {event.category && (
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: event.category.color, color: event.category.color }}
                      >
                        {event.category.name}
                      </Badge>
                    </div>
                  )}

                  {event.contact_name && (
                    <div className="text-xs text-gray-500">
                      Contact: {event.contact_name}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{getVisibilityInfo(selectedEvent.visibility_level).icon}</span>
                {selectedEvent.title}
                <Badge 
                  variant={getStatusColor(selectedEvent.status) === 'green' ? 'default' : getStatusColor(selectedEvent.status) === 'red' ? 'destructive' : 'secondary'}
                  className="ml-auto"
                >
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold mb-2">Date & Time</h3>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {formatDateTime(selectedEvent.start_date, selectedEvent.start_time).date}
                          {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.start_date && 
                            ` - ${formatDateTime(selectedEvent.end_date, selectedEvent.end_time).date}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {formatDateTime(selectedEvent.start_date, selectedEvent.start_time).time} - 
                          {formatDateTime(selectedEvent.end_date || selectedEvent.start_date, selectedEvent.end_time).time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.location_name && (
                    <div>
                      <h3 className="font-semibold mb-2">Location</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>{selectedEvent.location_name}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold mb-2">Visibility & Access</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        {selectedEvent.visibility_level === 'staff_only' && <Eye className="h-4 w-4 text-blue-500" />}
                        {selectedEvent.visibility_level === 'leadership_only' && <EyeOff className="h-4 w-4 text-purple-500" />}
                        {selectedEvent.visibility_level === 'hr_only' && <EyeOff className="h-4 w-4 text-red-500" />}
                        {selectedEvent.visibility_level === 'admin_only' && <EyeOff className="h-4 w-4 text-gray-500" />}
                        <span>{getVisibilityInfo(selectedEvent.visibility_level).label}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {getVisibilityInfo(selectedEvent.visibility_level).description}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.category && (
                    <div>
                      <h3 className="font-semibold mb-2">Category</h3>
                      <Badge 
                        variant="outline"
                        style={{ borderColor: selectedEvent.category.color, color: selectedEvent.category.color }}
                      >
                        {selectedEvent.category.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.contact_name && (
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Contact:</strong> {selectedEvent.contact_name}</div>
                    {selectedEvent.contact_email && (
                      <div><strong>Email:</strong> {selectedEvent.contact_email}</div>
                    )}
                  </div>
                </div>
              )}

              {selectedEvent.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Internal Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedEvent.notes}</p>
                </div>
              )}

              {/* Approval Status */}
              {selectedEvent.approval_required && (
                <div>
                  <h3 className="font-semibold mb-2">Approval Status</h3>
                  {selectedEvent.approved_at ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Approved on {new Date(selectedEvent.approved_at).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Pending approval</span>
                    </div>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Created: {new Date(selectedEvent.created_at).toLocaleString()}</div>
                  <div>Updated: {new Date(selectedEvent.updated_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-1" />
                Edit Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}