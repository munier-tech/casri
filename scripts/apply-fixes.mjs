import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const BRANCH = 'fix/data-normalization-products-categories';
const root = process.cwd();

function log(msg) { console.log(`[fix] ${msg}`); }

async function ensureDir(filePath) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeFile(filePath, content) {
  await ensureDir(filePath);
  await fsp.writeFile(filePath, content, 'utf8');
  log(`wrote ${path.relative(root, filePath)}`);
}

function fileExists(p) { try { fs.accessSync(p); return true; } catch { return false; } }

function tryExec(cmd) {
  try { execSync(cmd, { stdio: 'inherit' }); return true; } catch { return false; }
}

function detectPM() {
  if (fileExists(path.join(root, 'yarn.lock'))) return 'yarn';
  if (fileExists(path.join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fileExists(path.join(root, 'bun.lockb'))) return 'bun';
  return 'npm';
}

function pmAddAxios() {
  try { require.resolve('axios', { paths: [root] }); log('axios already installed'); return; } catch {}
  const pm = detectPM();
  log(`installing axios with ${pm}...`);
  const cmd = pm === 'yarn' ? 'yarn add axios'
    : pm === 'pnpm' ? 'pnpm add axios'
    : pm === 'bun' ? 'bun add axios'
    : 'npm i axios';
  tryExec(cmd);
}

function gitInitAndBranch() {
  if (!tryExec('git rev-parse --is-inside-work-tree >/dev/null 2>&1')) {
    tryExec('git init');
  }
  // create/switch branch
  if (!tryExec(`git switch -c ${BRANCH}`)) {
    tryExec(`git checkout -b ${BRANCH}`);
  }
}

async function addCoreFiles() {
  await writeFile(path.join(root, 'src/utils/normalize.js'), `
export function toArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (typeof value === 'object') return Object.values(value);
  return [];
}

export function pickList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.categories)) return data.categories;
  if (typeof data === 'object') return Object.values(data);
  return [];
}

export function pickEntity(data) {
  if (!data) return null;
  if (data.product) return data.product;
  if (data.category) return data.category;
  if (data.data && typeof data.data === 'object') return data.data;
  return data;
}

export function getId(entity) {
  return entity?.id ?? entity?._id ?? entity?.uuid ?? null;
}
`.trimStart());

  await writeFile(path.join(root, 'src/api/client.js'), `
import axios from 'axios';

const baseURL =
  (typeof import !== 'undefined' && import.meta?.env?.VITE_API_URL) ||
  (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_API_URL) ||
  '';

export const api = axios.create({
  baseURL,
  // withCredentials: true, // enable if using cookies/sessions
});
`.trimStart());

  await writeFile(path.join(root, 'src/api/products.js'), `
import { api } from './client';
import { pickList, pickEntity, getId } from '../utils/normalize';

export async function fetchProducts() {
  const { data } = await api.get('/api/products');
  return pickList(data);
}

export async function createProduct(payload) {
  const { data } = await api.post('/api/products', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return pickEntity(data) || null;
}

export async function updateProduct(id, changes) {
  const { data } = await api.patch(\`/api/products/\${id}\`, changes, {
    headers: { 'Content-Type': 'application/json' },
  });
  return pickEntity(data) || null;
}

export async function deleteProduct(id) {
  await api.delete(\`/api/products/\${id}\`);
  return true;
}

export function getEntityId(entity) {
  return getId(entity);
}
`.trimStart());

  await writeFile(path.join(root, 'src/api/categories.js'), `
import { api } from './client';
import { pickList, pickEntity, getId } from '../utils/normalize';

export async function fetchCategories() {
  const { data } = await api.get('/api/categories');
  return pickList(data);
}

export async function createCategory(payload) {
  const { data } = await api.post('/api/categories', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return pickEntity(data) || null;
}

export async function updateCategory(id, changes) {
  const { data } = await api.patch(\`/api/categories/\${id}\`, changes, {
    headers: { 'Content-Type': 'application/json' },
  });
  return pickEntity(data) || null;
}

export async function deleteCategory(id) {
  await api.delete(\`/api/categories/\${id}\`);
  return true;
}

export function getEntityId(entity) {
  return getId(entity);
}
`.trimStart());

  await writeFile(path.join(root, 'src/hooks/useCollection.js'), `
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toArray } from '../utils/normalize';

export function useCollection(service) {
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await service.fetchList();
      setList(toArray(items));
    } catch (e) {
      setError(e);
      setList([]);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload) => {
    try {
      const created = await service.createOne(payload);
      if (!created) { await load(); return null; }
      const id = service.getEntityId(created);
      setList(prev => {
        const next = toArray(prev);
        return id != null && next.some(x => service.getEntityId(x) === id) ? next : [created, ...next];
      });
      return created;
    } catch (e) {
      setError(e);
      await load();
      return null;
    }
  }, [service, load]);

  const update = useCallback(async (id, changes) => {
    try {
      const updated = await service.updateOne(id, changes);
      if (!updated) { await load(); return null; }
      const updatedId = service.getEntityId(updated) ?? id;
      setList(prev => toArray(prev).map(item =>
        service.getEntityId(item) === updatedId ? { ...item, ...updated } : item
      ));
      return updated;
    } catch (e) {
      setError(e);
      await load();
      return null;
    }
  }, [service, load]);

  const remove = useCallback(async (id) => {
    try {
      await service.deleteOne(id);
      setList(prev => toArray(prev).filter(item => service.getEntityId(item) !== id));
      return true;
    } catch (e) {
      setError(e);
      await load();
      return false;
    }
  }, [service, load]);

  return {
    list: useMemo(() => toArray(list), [list]),
    isLoading,
    error,
    reload: load,
    create,
    update,
    remove,
  };
}
`.trimStart());

  await writeFile(path.join(root, 'src/hooks/useProducts.js'), `
import { useCollection } from './useCollection';
import * as svc from '../api/products';

const service = {
  fetchList: svc.fetchProducts,
  createOne: svc.createProduct,
  updateOne: svc.updateProduct,
  deleteOne: svc.deleteProduct,
  getEntityId: svc.getEntityId,
};

export function useProducts() {
  return useCollection(service);
}
`.trimStart());

  await writeFile(path.join(root, 'src/hooks/useCategories.js'), `
import { useCollection } from './useCollection';
import * as svc from '../api/categories';

const service = {
  fetchList: svc.fetchCategories,
  createOne: svc.createCategory,
  updateOne: svc.updateCategory,
  deleteOne: svc.deleteCategory,
  getEntityId: svc.getEntityId,
};

export function useCategories() {
  return useCollection(service);
}
`.trimStart());

  if (!fileExists(path.join(root, '.env.example'))) {
    await writeFile(path.join(root, '.env.example'), `
VITE_API_URL=http://localhost:5000
# NEXT_PUBLIC_API_URL=http://localhost:5000
`.trimStart());
  }
}

async function replaceInFile(filePath, replacements) {
  const orig = await fsp.readFile(filePath, 'utf8');
  let updated = orig;
  for (const { re, to } of replacements) {
    updated = updated.replace(re, to);
  }
  if (updated !== orig) {
    await fsp.writeFile(filePath, updated, 'utf8');
    log(`updated ${path.relative(root, filePath)}`);
  }
}

async function normalizeArrayUsages() {
  const targets = ['src', 'app', 'pages', 'components']
    .map(d => path.join(root, d))
    .filter(d => fileExists(d) && fs.statSync(d).isDirectory());

  const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);
  const files = [];

  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) { walk(p); }
      else if (exts.has(path.extname(name))) { files.push(p); }
    }
  }

  for (const d of targets) walk(d);

  const safeProducts = '(Array.isArray(products)?products:(products&&typeof products=="object"?Object.values(products):[]))';
  const safeCategories = '(Array.isArray(categories)?categories:(categories&&typeof categories=="object"?Object.values(categories):[]))';

  for (const f of files) {
    await replaceInFile(f, [
      { re: /products\.reduce\(/g, to: `${safeProducts}.reduce(` },
      { re: /products\.map\(/g, to: `${safeProducts}.map(` },
      { re: /categories\.reduce\(/g, to: `${safeCategories}.reduce(` },
      { re: /categories\.map\(/g, to: `${safeCategories}.map(` },
      // Common mistake: setCategories(data) instead of data.categories
      { re: /setCategories\(\s*data\s*\)/g, to: 'setCategories(Array.isArray(data?.categories)?data.categories:[])' },
    ]);
  }
}

async function ensureExpressParsers() {
  const candidateDirs = ['', 'server', 'backend', 'api'].map(d => path.join(root, d)).filter(d => fileExists(d) && fs.statSync(d).isDirectory());
  const candidateFiles = ['server.js', 'app.js', 'index.js', 'server.ts', 'app.ts', 'index.ts'];

  for (const d of candidateDirs) {
    for (const name of candidateFiles) {
      const p = path.join(d, name);
      if (!fileExists(p)) continue;
      const src = await fsp.readFile(p, 'utf8');
      if (!/express\(\)/.test(src)) continue;
      if (/express\.json\(\)/.test(src)) continue; // already present

      const lines = src.split('\n');
      let inserted = false;
      for (let i = 0; i < lines.length; i++) {
        if (/express\(\)/.test(lines[i]) && /app\s*=\s*express\(\)|const\s+app\s*=\s*express\(\)/.test(src)) {
          // insert after first occurrence of express() init
          lines.splice(i + 1, 0, 'app.use(express.json());', 'app.use(express.urlencoded({ extended: true }));');
          inserted = true;
          break;
        }
      }
      if (inserted) {
        await fsp.writeFile(p, lines.join('\n'), 'utf8');
        log(`inserted express body parsers in ${path.relative(root, p)}`);
      }
    }
  }
}

async function commitAndPush() {
  tryExec('git add -A');
  tryExec('git commit -m "Add data normalization, API services, hooks; normalize products/categories usages; ensure Express JSON parsing"');
  // push if remote exists
  const remotes = execSync('git remote', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  if (remotes) {
    tryExec(`git push -u ${remotes.split('\n')[0]} ${BRANCH}`);
  } else {
    log('no git remote configured; skipped push');
  }
}

(async function main() {
  log('starting');
  gitInitAndBranch();
  pmAddAxios();
  await addCoreFiles();
  await normalizeArrayUsages();
  await ensureExpressParsers();
  await commitAndPush();
  log('done');
})();
