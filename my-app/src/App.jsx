import { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc, query, orderBy 
} from 'firebase/firestore';

import { 
  Container, Paper, Typography, TextField, IconButton, 
  List, ListItem, ListItemText, ListItemIcon, Box, 
  Tooltip, InputAdornment, Fade 
} from '@mui/material';

import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DeleteOutline as DeleteIcon,
  RadioButtonUnchecked as CircleIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingBasketOutlined as BasketIcon
} from '@mui/icons-material';

function App() {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Lắng nghe dữ liệu thời gian thực từ Firestore
  useEffect(() => {
    const q = query(collection(db, "todos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  // 2. Thêm món đồ mới
  const handleAddButtonClick = async () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      setErrorMsg('Vui lòng nhập tên món đồ!');
      return;
    }

    const isDuplicate = items.some(
      (item) => item.itemName.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (isDuplicate) {
      setErrorMsg('Món đồ này đã có trong danh sách!');
      return;
    }

    try {
      await addDoc(collection(db, "todos"), {
        itemName: trimmedValue,
        quantity: 1,
        isSelected: false,
        createdAt: new Date()
      });
      setInputValue('');
      setErrorMsg('');
    } catch (e) {
      console.error("Lỗi khi thêm: ", e);
    }
  };

  // 3. Cập nhật số lượng
  const handleQuantityUpdate = async (id, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty >= 0) {
      const itemRef = doc(db, "todos", id);
      await updateDoc(itemRef, { quantity: newQty });
    }
  };

  // 4. Đánh dấu hoàn thành
  const toggleComplete = async (id, currentStatus) => {
    const itemRef = doc(db, "todos", id);
    await updateDoc(itemRef, { isSelected: !currentStatus });
  };

  // 5. Xóa món đồ
  const handleDeleteItem = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  const totalItemCount = items.reduce(
    (total, item) => item.isSelected ? total : total + item.quantity, 0
  );

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      py: 5 
    }}>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 5, bgcolor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)' }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 1 }}>
            <BasketIcon color="primary" fontSize="large" />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#2c3e50' }}>
              My List
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Thêm món đồ mới..."
              value={inputValue}
              error={!!errorMsg}
              helperText={errorMsg}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddButtonClick()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="primary" onClick={handleAddButtonClick} edge="end">
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Box>

          <List sx={{ width: '100%', maxHeight: 350, overflow: 'auto', pr: 1 }}>
            {items.map((item) => (
              <Fade in={true} key={item.id}>
                <ListItem
                  divider
                  sx={{ px: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" onClick={() => handleQuantityUpdate(item.id, item.quantity, -1)}>
                        <ChevronLeftIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ mx: 0.5, fontWeight: 'bold', minWidth: 20, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton size="small" onClick={() => handleQuantityUpdate(item.id, item.quantity, 1)}>
                        <ChevronRightIcon fontSize="small" />
                      </IconButton>
                      <Tooltip title="Xóa">
                        <IconButton size="small" color="error" sx={{ ml: 1 }} onClick={() => handleDeleteItem(item.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemIcon sx={{ cursor: 'pointer', minWidth: 40 }} onClick={() => toggleComplete(item.id, item.isSelected)}>
                    {item.isSelected ? <CheckCircleIcon color="success" /> : <CircleIcon color="action" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.itemName}
                    onClick={() => toggleComplete(item.id, item.isSelected)}
                    sx={{ 
                      cursor: 'pointer',
                      textDecoration: item.isSelected ? 'line-through' : 'none',
                      color: item.isSelected ? 'text.secondary' : 'text.primary',
                    }}
                  />
                </ListItem>
              </Fade>
            ))}
          </List>

          <Box sx={{ 
            mt: 4, p: 2, borderRadius: 4, bgcolor: '#1976d2', 
            boxShadow: '0 4px 20px rgba(25, 118, 210, 0.4)', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tổng chưa mua:</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>{totalItemCount}</Typography>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}

export default App;