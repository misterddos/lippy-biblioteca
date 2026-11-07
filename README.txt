LIPPY BIBLIOTECA LOCAL
======================

O projeto usa a pasta ~/biblioteca que você já possui. Ele não move, renomeia
ou apaga seus PDFs.

INSTALAÇÃO NO TERMUX
1. Extraia o ZIP.
2. Entre na pasta lippy_biblioteca_local.
3. Execute:
   pkg update
   pkg install python
   python -m pip install -r requirements.txt
   python app.py
4. Abra no navegador:
   http://127.0.0.1:5000

Se a pasta de livros tiver outro caminho:
   LIPPY_LIBRARY_DIR="$HOME/biblioteca" python app.py

COMO ORGANIZAR
O site identifica categorias pelo nome das subpastas. Exemplo:
~/biblioteca/Filosofia/Meu livro.pdf
~/biblioteca/Ciência/Outro livro.pdf

Se um PDF estiver diretamente em ~/biblioteca, ele aparece em "Outros".

RECURSOS
- Lista automaticamente os PDFs existentes.
- Pesquisa por título e filtro por categoria.
- Abre o PDF no navegador.
- Favoritos salvos no navegador (localStorage).
- Funciona sem internet depois de instalar o Flask.
- Servidor escuta somente em 127.0.0.1 (não fica exposto à rede).

PARAR
No Termux, pressione CTRL+C.
