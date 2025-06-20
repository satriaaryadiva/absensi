'use client'
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nama: '',
    nim: '',
    departement: '',
    email: '',
    password: ''
  });

  const handleRegister = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await addDoc(collection(db, 'users'), {
        uid: user.user.uid,
        nama: form.nama,
        nim: form.nim,
        departement: form.departement,
        email: form.email
      });
      alert('Berhasil daftar!');
    } catch (err) {
      console.error(err);
      alert('Gagal daftar, cek ulang data!');
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Daftar Akun</h1>
      <input
        placeholder="Nama"
        className="border p-2 w-full mb-2"
        onChange={e => setForm({ ...form, nama: e.target.value })}
      />
      <input
        placeholder="NIM"
        className="border p-2 w-full mb-2"
        onChange={e => setForm({ ...form, nim: e.target.value })}
      />
      <input
        placeholder="Departemen"
        className="border p-2 w-full mb-2"
        onChange={e => setForm({ ...form, departement: e.target.value })}
      />
      <input
        placeholder="Email"
        type="email"
        className="border p-2 w-full mb-2"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        className="border p-2 w-full mb-4"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <button
        onClick={handleRegister}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 w-full rounded"
      >
        Daftar
      </button>
    </div>
  );
}
