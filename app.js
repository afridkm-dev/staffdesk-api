const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const employeeRouter = express.Router();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

function mapRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    role: row.role,
    department: row.department,
    email: row.email,
    phone: row.phone,
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function pickFields(body) {
  return {
    name: body.name,
    role: body.role ?? '',
    department: body.department ?? '',
    email: (body.email ?? '').toLowerCase(),
    phone: body.phone ?? '',
    avatar_color: body.avatarColor ?? '#2F4858',
  };
}

employeeRouter.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data.map(mapRow));
  } catch (error) {
    next(error);
  }
});

employeeRouter.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(mapRow(data));
  } catch (error) {
    next(error);
  }
});

employeeRouter.post('/', async (req, res, next) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const { data, error } = await supabase
      .from('employees')
      .insert(pickFields(req.body))
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json(mapRow(data));
  } catch (error) {
    next(error);
  }
});

employeeRouter.put('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(pickFields(req.body))
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(mapRow(data));
  } catch (error) {
    next(error);
  }
});

employeeRouter.delete('/:id', async (req, res, next) => {
  try {
    const { error, count } = await supabase
      .from('employees')
      .delete({ count: 'exact' })
      .eq('id', req.params.id);

    if (error) throw error;
    if (count === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(['/api/employees', '/employees'], employeeRouter);

const frontendDirectories = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'build'),
];

const frontendDirectory = frontendDirectories.find((directory) => fs.existsSync(directory));
if (frontendDirectory) {
  app.use(express.static(frontendDirectory));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDirectory, 'index.html'));
  });
}

app.use((error, _req, res, _next) => {
  res.status(500).json({ message: 'Server error', details: error.message });
});

module.exports = { app, supabase };
