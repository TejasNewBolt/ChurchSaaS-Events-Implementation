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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  MapPin, 
  Users, 
  Calendar, 
  Settings, 
  TrendingUp,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  Building
} from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client - replace with your actual values
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Location {
  id: string
  name: string
  description: string | null
  location_type: 'worship_space' | 'meeting_room' | 'fellowship_area' | 'office' | 'outdoor_area' | 'utility_space'
  capacity: number | null
  equipment_list: string[]
  setup_time_minutes: number
  cleanup_time_minutes: number
  requires_approval: boolean
  access_restrictions: string | null
  booking_instructions: string | null
  maintenance_notes: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface LocationBooking {
  id: string
  title: string
  start_datetime: string
  end_datetime: string
  booking_type: string
  booking_status: string
  event?: {
    title: string
    event_type: string
  }
}

interface LocationUsageAnalytics {
  location_id: string
  total_bookings: number
  total_hours_used: number
  utilization_percentage: number
  most_common_event_type: string | null
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [bookings, setBookings] = useState<LocationBooking[]>([])
  const [analytics, setAnalytics] = useState<LocationUsageAnalytics[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Use the church_id from your database
  const churchId = 'be182854-02b4-43b6-9123-3229daabea7d'

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location_type: 'meeting_room',
    capacity: '',
    equipment_list: '',
    setup_time_minutes: '15',
    cleanup_time_minutes: '15',
    requires_approval: false,
    access_restrictions: '',
    booking_instructions: '',
    maintenance_notes: ''
  })

  const locationTypes = [
    { value: 'worship_space', label: 'Worship Space', icon: '⛪' },
    { value: 'meeting_room', label: 'Meeting Room', icon: '🏢' },
    { value: 'fellowship_area', label: 'Fellowship Area', icon: '🍽️' },
    { value: 'office', label: 'Office', icon: '💼' },
    { value: 'outdoor_area', label: 'Outdoor Area', icon: '🌳' },
    { value: 'utility_space', label: 'Utility Space', icon: '🔧' }
  ]

  // Fetch locations
  const fetchLocations = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('church_locations')
        .select('*')
        .eq('church_id', churchId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setLocations(data || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch location bookings
  const fetchLocationBookings = async (locationId: string) => {
    try {
      const { data, error } = await supabase
        .from('location_bookings')
        .select(`
          *,
          events:event_id(title, event_type)
        `)
        .eq('location_id', locationId)
        .eq('booking_status', 'confirmed')
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
        .limit(10)

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  // Fetch usage analytics
  const fetchUsageAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('location_usage_analytics')
        .select('*')
        .eq('church_id', churchId)
        .eq('period_type', 'monthly')
        .eq('analysis_date', new Date().toISOString().split('T')[0])

      if (error) throw error
      setAnalytics(data || [])
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  useEffect(() => {
    fetchLocations()
    fetchUsageAnalytics()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const equipmentArray = formData.equipment_list
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)

      const locationData = {
        church_id: churchId,
        name: formData.name,
        description: formData.description || null,
        location_type: formData.location_type,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        equipment_list: equipmentArray,
        setup_time_minutes: parseInt(formData.setup_time_minutes),
        cleanup_time_minutes: parseInt(formData.cleanup_time_minutes),
        requires_approval: formData.requires_approval,
        access_restrictions: formData.access_restrictions || null,
        booking_instructions: formData.booking_instructions || null,
        maintenance_notes: formData.maintenance_notes || null
      }

      const { error } = await supabase
        .from('church_locations')
        .insert([locationData])

      if (error) throw error

      // Reset form and refresh data
      setFormData({
        name: '',
        description: '',
        location_type: 'meeting_room',
        capacity: '',
        equipment_list: '',
        setup_time_minutes: '15',
        cleanup_time_minutes: '15',
        requires_approval: false,
        access_restrictions: '',
        booking_instructions: '',
        maintenance_notes: ''
      })
      setIsDialogOpen(false)
      fetchLocations()
    } catch (error) {
      console.error('Error creating location:', error)
    }
  }

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location)
    fetchLocationBookings(location.id)
  }

  const getLocationTypeIcon = (type: string) => {
    const typeObj = locationTypes.find(t => t.value === type)
    return typeObj?.icon || '📍'
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-blue-500'
    return 'bg-green-500'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8 text-purple-500" />
            Event Locations
          </h1>
          <p className="text-gray-600 mt-1">
            Manage event venues, rooms, resources, and booking coordination across all church facilities
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Location Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location_type">Location Type *</Label>
                  <Select
                    value={formData.location_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, location_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacity (people)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="equipment_list">Equipment (comma-separated)</Label>
                  <Input
                    id="equipment_list"
                    value={formData.equipment_list}
                    onChange={(e) => setFormData(prev => ({ ...prev, equipment_list: e.target.value }))}
                    placeholder="projector, sound system, chairs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="setup_time">Setup Time (minutes)</Label>
                  <Input
                    id="setup_time"
                    type="number"
                    min="0"
                    value={formData.setup_time_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, setup_time_minutes: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cleanup_time">Cleanup Time (minutes)</Label>
                  <Input
                    id="cleanup_time"
                    type="number"
                    min="0"
                    value={formData.cleanup_time_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, cleanup_time_minutes: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="booking_instructions">Booking Instructions</Label>
                <Textarea
                  id="booking_instructions"
                  value={formData.booking_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, booking_instructions: e.target.value }))}
                  rows={3}
                  placeholder="Special instructions for booking this location..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requires_approval"
                  checked={formData.requires_approval}
                  onChange={(e) => setFormData(prev => ({ ...prev, requires_approval: e.target.checked }))}
                />
                <Label htmlFor="requires_approval">Requires approval for booking</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Location
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="locations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Usage Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-6">
          {/* Locations Grid */}
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <Card 
                  key={location.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleLocationClick(location)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-xl">{getLocationTypeIcon(location.location_type)}</span>
                      {location.name}
                      {location.requires_approval && (
                        <Badge variant="secondary" className="ml-auto">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Approval Required
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {locationTypes.find(t => t.value === location.location_type)?.label}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {location.description && (
                      <p className="text-sm text-gray-700">{location.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {location.capacity && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {location.capacity} people
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {location.setup_time_minutes + location.cleanup_time_minutes}min buffer
                      </div>
                    </div>

                    {location.equipment_list && location.equipment_list.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Equipment:</p>
                        <div className="flex flex-wrap gap-1">
                          {location.equipment_list.slice(0, 3).map((equipment, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {equipment}
                            </Badge>
                          ))}
                          {location.equipment_list.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{location.equipment_list.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Usage Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.map((stat) => {
              const location = locations.find(l => l.id === stat.location_id)
              return (
                <Card key={stat.location_id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {location?.name || 'Unknown Location'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Utilization</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getUtilizationColor(stat.utilization_percentage)} rounded-full`}
                            style={{ width: `${stat.utilization_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stat.utilization_percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Bookings</span>
                        <p className="font-semibold">{stat.total_bookings}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Hours Used</span>
                        <p className="font-semibold">{stat.total_hours_used.toFixed(1)}h</p>
                      </div>
                    </div>
                    
                    {stat.most_common_event_type && (
                      <div>
                        <span className="text-xs text-gray-500">Most Common Use:</span>
                        <Badge variant="secondary" className="ml-2">
                          {stat.most_common_event_type}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {analytics.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No usage analytics available yet. Analytics will appear after locations have been used for events.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Location Details Dialog */}
      {selectedLocation && (
        <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-xl">{getLocationTypeIcon(selectedLocation.location_type)}</span>
                {selectedLocation.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Location Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{locationTypes.find(t => t.value === selectedLocation.location_type)?.label}</span>
                    </div>
                    {selectedLocation.capacity && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span>{selectedLocation.capacity} people</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Setup Time:</span>
                      <span>{selectedLocation.setup_time_minutes} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cleanup Time:</span>
                      <span>{selectedLocation.cleanup_time_minutes} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requires Approval:</span>
                      <span>{selectedLocation.requires_approval ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  
                  {selectedLocation.description && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-sm text-gray-600">{selectedLocation.description}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Equipment Available</h3>
                  {selectedLocation.equipment_list && selectedLocation.equipment_list.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedLocation.equipment_list.map((equipment, index) => (
                        <Badge key={index} variant="outline">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No equipment listed</p>
                  )}
                  
                  {selectedLocation.booking_instructions && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-1">Booking Instructions</h4>
                      <p className="text-sm text-gray-600">{selectedLocation.booking_instructions}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Upcoming Bookings */}
              <div>
                <h3 className="font-semibold mb-3">Upcoming Bookings</h3>
                {bookings.length > 0 ? (
                  <div className="space-y-2">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{booking.title}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.start_datetime).toLocaleDateString()} at{' '}
                                {new Date(booking.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {' '}-{' '}
                                {new Date(booking.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <Badge variant={booking.booking_type === 'event' ? 'default' : 'secondary'}>
                              {booking.booking_type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No upcoming bookings</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedLocation(null)}>
                Close
              </Button>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-1" />
                Edit Location
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}