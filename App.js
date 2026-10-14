import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { load(); }, []);
  useEffect(() => { save(); }, [customers]);

  const load = async () => {
    const d = await AsyncStorage.getItem('khata');
    if (d) setCustomers(JSON.parse(d));
  };
  const save = async () => {
    await AsyncStorage.setItem('khata', JSON.stringify(customers));
  };

  const addCustomer = () => {
    if (!name.trim()) return Alert.alert('Naam likho');
    setCustomers([...customers, { id: Date.now().toString(), name, transactions: [] }]);
    setName('');
  };

  const addTrans = (type) => {
    if (!amount) return;
    const amt = parseFloat(amount);
    const updated = customers.map(c => {
      if (c.id === selected.id) {
        return {...c, transactions: [...c.transactions, { id: Date.now().toString(), amount: amt, type, note, date: new Date().toLocaleDateString() }] };
      }
      return c;
    });
    setCustomers(updated);
    const newSel = updated.find(c => c.id === selected.id);
    setSelected(newSel);
    setAmount(''); setNote('');
  };

  const getBalance = (trans) => {
    return trans.reduce((s, t) => s + (t.type === 'udhaar'? t.amount : -t.amount), 0);
  };

  const totalBalance = customers.reduce((s, c) => s + getBalance(c.transactions), 0);

  if (selected) {
    const bal = getBalance(selected.transactions);
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSelected(null)}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>{selected.name}</Text>
        <Text style={[styles.bal, { color: bal >= 0? 'red' : 'green' }]}>Baqaya: Rs {bal} {bal>=0? '(Lena hai)' : '(Dena hai)'}</Text>

        <View style={styles.row}>
          <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          <TextInput style={styles.input} placeholder="Note (optional)" value={note} onChangeText={setNote} />
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#e74c3c' }]} onPress={() => addTrans('udhaar')}><Text style={styles.btnT}>UDHAAR DIYA</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#27ae60' }]} onPress={() => addTrans('jama')}><Text style={styles.btnT}>PAISA LIYA</Text></TouchableOpacity>
        </View>

        <FlatList data={[...selected.transactions].reverse()} keyExtractor={i=>i.id}
          renderItem={({item})=>(
            <View style={styles.card}>
              <Text style={{ fontWeight: 'bold', color: item.type==='udhaar'? 'red' : 'green' }}>{item.type==='udhaar'? 'Udhaar: ' : 'Jama: '} Rs {item.amount}</Text>
