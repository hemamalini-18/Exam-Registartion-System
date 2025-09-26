import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
          setUser(data.user)
        } catch (e) {
          setToken('')
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
  }, [token])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setUser(data.user)
    setToken(data.token)
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    setUser(data.user)
    setToken(data.token)
  }

  const logout = () => {
    setUser(null)
    setToken('')
    localStorage.removeItem('token')
  }

  const value = useMemo(() => ({ user, token, login, register, logout, loading }), [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
