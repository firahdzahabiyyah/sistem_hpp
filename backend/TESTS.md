# Quick API tests (curl)

Pastikan server berjalan (`npm run dev` di folder `backend`).

1) Buat ingredient

```
curl -X POST http://localhost:4000/api/ingredients -H "Content-Type: application/json" -d \
'{"name":"Ayam", "unit":"g", "net_weight":1000, "price":50000}'
```

2) Dapatkan daftar ingredient

```
curl http://localhost:4000/api/ingredients
```

3) Buat recipe (pre-recipe) dengan details

```
curl -X POST http://localhost:4000/api/recipes -H "Content-Type: application/json" -d \
'{"name":"Bumbu Ayam", "details":[{"name":"Ayam","usage":100,"unit":"g","net_weight":1000,"price":50000}] }'
```

4) Buat product

```
curl -X POST http://localhost:4000/api/products -H "Content-Type: application/json" -d \
'{"name":"Mie Ayam", "details":[{"name":"Bumbu Ayam","usage":50,"unit":"g","net_weight":1000,"price":20000}] }'
```

5) Dapatkan HPP product

```
curl http://localhost:4000/api/products/1/hpp
```

6) Tambah labor

```
curl -X POST http://localhost:4000/api/labor -H "Content-Type: application/json" -d \
'{"employee_name":"Koki","salary":3000000,"work_days":25}'
```

7) Tambah overhead

```
curl -X POST http://localhost:4000/api/overheads -H "Content-Type: application/json" -d \
'{"name":"Listrik","total_cost":500000,"duration_days":30}'
```

Catatan: API akan mengembalikan data JSON. Jika ada error, periksa console backend.
