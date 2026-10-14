
import { defineStore,acceptHMRUpdate } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  status: 'active' | 'inactive' | 'suspended'
  registrationDate: Date
  lastLogin?: Date
  totalShipments: number
  totalValue: number
  preferredServices: string[]
  notes?: string
  avatar?: string
}

export const useCustomersStore = defineStore('customers', {
  state: () => ({
    customers: [] as Customer[],
    loading: false,
    selectedCustomer: null as Customer | null
  }),

  getters: {
    activeCustomers: (state) => state.customers.filter(c => c.status === 'active'),
    inactiveCustomers: (state) => state.customers.filter(c => c.status === 'inactive'),
    suspendedCustomers: (state) => state.customers.filter(c => c.status === 'suspended'),
    topCustomers: (state) => state.customers
      .filter(c => c.status === 'active')
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10),
    
    getCustomerById: (state) => (id: string) => state.customers.find(c => c.id === id),
    getCustomerByEmail: (state) => (email: string) => state.customers.find(c => c.email === email)
  },

  actions: {
    async fetchCustomers() {
      this.loading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 800))
        this.customers = this.generateMockCustomers()
      } catch (error) {
        console.log('Failed to fetch customers:', error)
      } finally {
        this.loading = false
      }
    },

    async createCustomer(customerData: Partial<Customer>) {
      const newCustomer: Customer = {
        id: uuidv4(),
        status: 'active',
        registrationDate: new Date(),
        totalShipments: 0,
        totalValue: 0,
        preferredServices: [],
        ...customerData
      } as Customer

      this.customers.unshift(newCustomer)
      return newCustomer
    },

    async updateCustomer(id: string, updates: Partial<Customer>) {
      const customer = this.customers.find(c => c.id === id)
      if (customer) {
        Object.assign(customer, updates)
      }
    },

    async updateCustomerStatus(id: string, status: Customer['status']) {
      const customer = this.customers.find(c => c.id === id)
      if (customer) {
        customer.status = status
      }
    },

    generateMockCustomers(): Customer[] {
      const companies = [
        'TechCorp Solutions', 'Global Logistics Inc', 'Retail Express', 'Manufacturing Plus',
        'E-commerce Hub', 'Supply Chain Masters', 'Distribution Network', 'Freight Solutions',
        'Cargo Express', 'Shipping Dynamics', 'Transport Alliance', 'Logistics Pro'
      ]
      
      const cities = [
        'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
        'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA'
      ]

      const services = ['Express Delivery', 'Standard Shipping', 'Freight Transport', 'Same Day', 'International']

      return Array.from({ length: 50 }, (_, i) => ({
        id: uuidv4(),
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        address: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
        city: cities[Math.floor(Math.random() * cities.length)].split(', ')[0],
        state: cities[Math.floor(Math.random() * cities.length)].split(', ')[1],
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        country: 'United States',
        status: ['active', 'inactive', 'suspended'][Math.floor(Math.random() * 3)] as Customer['status'],
        registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        totalShipments: Math.floor(Math.random() * 100) + 1,
        totalValue: Math.floor(Math.random() * 500000) + 10000,
        preferredServices: services.slice(0, Math.floor(Math.random() * 3) + 1),
        avatar: `https://images.pexels.com/photos/${2000000 + i}/pexels-photo-${2000000 + i}.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`
      }))
    }
  }
})


// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCustomersStore, import.meta.hot))
}