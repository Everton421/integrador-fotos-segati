import 'dotenv/config';
import { Router } from "express";
import { conn2, db_publico, db_vendas } from "./database/mysql-connection.ts";
import path from 'node:path';

const router = Router();

let cachedFotoPath: string | null = null;

async function getFotoPath(): Promise<string> {
  if (!cachedFotoPath) {
    const [rows] = await conn2.query(
      `SELECT CAST(FOTOS AS CHAR(10000) CHARACTER SET latin1) as FOTOS FROM ${db_vendas}.parametros`
    );
    cachedFotoPath = (rows as any[])[0]?.FOTOS || '';
  }
  return cachedFotoPath!;
}

router.get('/foto/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      res.status(400).send('Invalid filename');
      return;
    }
    const fotoPath = await getFotoPath();
    const filePath = path.join(fotoPath, filename);
    res.sendFile(filePath);
  } catch {
    res.status(404).send('File not found');
  }
});

router.get('/', async (req, res) => {
  const search = (req.query.search as string) || '';
  const grupo = (req.query.grupo as string) || '';
  const subgrupo = (req.query.subgrupo as string) || '';
  const foto_filtro = (req.query.foto_filtro as string) || '';
  const marca = (req.query.marca as string) || '';
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  try {
    const conditions: string[] = ['p.ATIVO = \'S\''];
    const params: any[] = [];

    if (search) {
      const terms = search.trim().split(/\s+/).filter(t => t.length > 0);
      if (terms.length > 0) {
        const termConditions = terms.map(() =>
          '(p.CODIGO LIKE ? OR p.DESCRICAO LIKE ? OR p.NUM_ORIGINAL LIKE ?)'
        );
        conditions.push(`(${termConditions.join(' AND ')})`);
        terms.forEach(term => {
          params.push(`%${term}%`, `%${term}%`, `%${term}%`);
        });
      }
    }
    if (grupo) {
      conditions.push('p.GRUPO = ?');
      params.push(grupo);
    }
    if (subgrupo) {
      conditions.push('p.SUBGRUPO = ?');
      params.push(subgrupo);
    }
    if (marca) {
      conditions.push('p.MARCA = ?');
      params.push(marca);
    }

    const joinType = foto_filtro === 'com' ? 'INNER JOIN' : 'LEFT JOIN';

    if (foto_filtro === 'sem') {
      conditions.push('f.PRODUTO IS NULL');
    }

    const whereClause = conditions.join(' AND ');

    const [countResult] = await conn2.query(
      `SELECT COUNT(DISTINCT p.CODIGO) as total
       FROM ${db_publico}.cad_prod p
       ${joinType} ${db_publico}.fotos_prod f ON f.PRODUTO = p.CODIGO
       WHERE ${whereClause}`,
      params
    );
    const totalRegistros = (countResult as any[])[0]?.total || 0;
    const totalPages = Math.ceil(totalRegistros / limit) || 1;

    const [products] = await conn2.query(
      `SELECT p.CODIGO, p.DESCRICAO, p.DESCR_CURTA_MKTPLACE, p.NUM_ORIGINAL,
              COUNT(f.SEQ) as QTD_FOTOS,
              CAST(GROUP_CONCAT(f.FOTO ORDER BY f.SEQ ASC SEPARATOR '||') AS CHAR) as FOTOS
       FROM ${db_publico}.cad_prod p
       ${joinType} ${db_publico}.fotos_prod f ON f.PRODUTO = p.CODIGO
       WHERE ${whereClause}
       GROUP BY p.CODIGO
       ORDER BY p.CODIGO
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [grupos] = await conn2.query(
      `SELECT CODIGO, NOME FROM ${db_publico}.cad_pgru ORDER BY NOME`
    );

    const [subgrupos] = await conn2.query(
      `SELECT CODIGO, DESCRICAO, COD_GRUPO FROM ${db_publico}.subgrupos ORDER BY DESCRICAO`
    );

    const [marcas] = await conn2.query(
      `SELECT CODIGO, DESCRICAO FROM ${db_publico}.cad_pmar ORDER BY DESCRICAO`
    );

    const dados = {
      ultimo_envio_preco: null,
      ultimo_envio_estoque: null,
      statusProdutos: false,
      total: 0
    };

    res.render('index', {
      dados,
      produtos: products as any[],
      filters: { search, grupo, subgrupo, foto_filtro, marca },
      grupos: grupos as any[],
      subgrupos: subgrupos as any[],
      marcas: marcas as any[],
      pagination: {
        page,
        limit,
        totalRegistros: [{ total: totalRegistros }],
        totalPages
      }
    });
  } catch (error) {
    console.error('Erro ao carregar catálogo:', error);
    res.status(500).send('Erro ao carregar catálogo');
  }
});

export { router };
