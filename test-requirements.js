const axios = require('axios');

// Test configuration
const BASE_URL = 'https://tododashboard-rpq8.onrender.com/api';
let authToken = '';
let testUserId = '';
let testTaskId = '';

// Test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

const testTask = {
  title: 'Test Task',
  description: 'This is a test task',
  status: 'todo',
  priority: 'medium'
};

// Utility functions
const log = (message, status = 'INFO') => {
  console.log(`[${status}] ${message}`);
};

const testEndpoint = async (name, testFn) => {
  try {
    log(`Testing: ${name}`);
    await testFn();
    log(`✅ ${name} - PASSED`, 'PASS');
    return true;
  } catch (error) {
    log(`❌ ${name} - FAILED: ${error.message}`, 'FAIL');
    return false;
  }
};

// Test functions
const testUserRegistration = async () => {
  const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
  authToken = response.data.token;
  testUserId = response.data.user.id;
  if (!authToken) throw new Error('No token received');
};

const testUserLogin = async () => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email: testUser.email,
    password: testUser.password
  });
  authToken = response.data.token;
  if (!authToken) throw new Error('No token received');
};

const testCreateTask = async () => {
  const response = await axios.post(`${BASE_URL}/tasks`, testTask, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  testTaskId = response.data._id;
  if (!testTaskId) throw new Error('No task ID received');
};

const testGetTasks = async () => {
  const response = await axios.get(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (!Array.isArray(response.data)) throw new Error('Tasks not returned as array');
};

const testUpdateTask = async () => {
  const updateData = { ...testTask, title: 'Updated Test Task', version: 0 };
  const response = await axios.put(`${BASE_URL}/tasks/${testTaskId}`, updateData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (response.data.title !== 'Updated Test Task') throw new Error('Task not updated');
};

const testMoveTask = async () => {
  const response = await axios.patch(`${BASE_URL}/tasks/${testTaskId}/move`, {
    status: 'in-progress'
  }, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (response.data.status !== 'in-progress') throw new Error('Task not moved');
};

const testSmartAssign = async () => {
  const response = await axios.post(`${BASE_URL}/tasks/${testTaskId}/smart-assign`, {}, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (!response.data.assignedTo) throw new Error('Smart assign failed');
};

const testGetActivities = async () => {
  const response = await axios.get(`${BASE_URL}/activities`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (!Array.isArray(response.data)) throw new Error('Activities not returned as array');
  if (response.data.length > 20) throw new Error('More than 20 activities returned');
};

const testDeleteTask = async () => {
  await axios.delete(`${BASE_URL}/tasks/${testTaskId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
};

const testValidation = async () => {
  // Test unique title validation
  try {
    await axios.post(`${BASE_URL}/tasks`, testTask, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    throw new Error('Should have failed with duplicate title');
  } catch (error) {
    if (error.response?.status !== 400) throw new Error('Expected 400 for duplicate title');
  }

  // Test column name validation
  try {
    await axios.post(`${BASE_URL}/tasks`, { ...testTask, title: 'todo' }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    throw new Error('Should have failed with column name');
  } catch (error) {
    if (error.response?.status !== 400) throw new Error('Expected 400 for column name');
  }
};

// Main test runner
const runTests = async () => {
  log('🚀 Starting Requirements Test Suite', 'START');
  
  const tests = [
    ['User Registration', testUserRegistration],
    ['User Login', testUserLogin],
    ['Create Task', testCreateTask],
    ['Get Tasks', testGetTasks],
    ['Update Task', testUpdateTask],
    ['Move Task', testMoveTask],
    ['Smart Assign', testSmartAssign],
    ['Get Activities (Last 20)', testGetActivities],
    ['Validation (Unique Title & Column Names)', testValidation],
    ['Delete Task', testDeleteTask]
  ];

  let passed = 0;
  let total = tests.length;

  for (const [name, testFn] of tests) {
    const result = await testEndpoint(name, testFn);
    if (result) passed++;
  }

  log(`\n📊 Test Results: ${passed}/${total} tests passed`, 'SUMMARY');
  
  if (passed === total) {
    log('🎉 ALL REQUIREMENTS IMPLEMENTED SUCCESSFULLY!', 'SUCCESS');
  } else {
    log('⚠️  Some requirements may need attention', 'WARNING');
  }
};

// Run tests
runTests().catch(error => {
  log(`Test suite failed: ${error.message}`, 'ERROR');
  process.exit(1);
}); 