import * as vscode from 'vscode';
import * as path from 'path';

interface NotebookMetadata {
    title: string;
    date: string;
    lastModified: string;
    category: string;
    tags: string[];
    slug: string;
    author: string;
    summary: string;
}

// Track processed notebooks to avoid duplicate metadata
const processedNotebooks = new Set<string>();

function getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function generateMetadataFromFilename(filename: string): NotebookMetadata {
    const baseName = path.basename(filename, '.ipynb');
    const title = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const currentDateTime = getCurrentDateTime();
    
    return {
        title: `${title}`,
        date: currentDateTime,
        lastModified: 'XXXX-XX-XX XX:XX',
        category: 'Add Category here',
        tags: ['tag1', 'tag2'],
        slug: slug,
        author: 'Abhijeet Adarsh',
        summary: `${title}`
    };
}

function createMetadataCell(metadata: NotebookMetadata): vscode.NotebookCellData {
    const metadataText = `Title: ${metadata.title}
Date: ${metadata.date}
Category: ${metadata.category}
Tags: ${metadata.tags}
Slug: ${metadata.slug}
Author: ${metadata.author}
Summary: ${metadata.summary}
Last Modified: ${metadata.lastModified}`;

    const cellData = new vscode.NotebookCellData(
        vscode.NotebookCellKind.Code,
        metadataText,
        'raw'
    );

    cellData.metadata = {
        editable: false,
        runnable: false
    };

    return cellData;
}

function hasMetadataCell(notebook: vscode.NotebookDocument): boolean {
    if (notebook.cellCount === 0) {
        return false;
    }
    
    const firstCell = notebook.cellAt(0);
    return firstCell.kind === vscode.NotebookCellKind.Code &&
           firstCell.document.languageId === 'raw' &&
           firstCell.document.getText().includes('Title:') &&
           firstCell.document.getText().includes('Date');
}

async function addMetadataToNotebook(notebook: vscode.NotebookDocument): Promise<boolean> {
    const notebookKey = notebook.uri.toString();
    
    if (processedNotebooks.has(notebookKey) || hasMetadataCell(notebook)) {
        return false;
    }
    
    console.log(`Adding metadata to notebook: ${notebook.uri.fsPath}`);
    
    const metadata = generateMetadataFromFilename(notebook.uri.fsPath);
    const metadataCell = createMetadataCell(metadata);
    
    // Create a standard, empty code cell to ensure the notebook's language is set correctly.
    const emptyCodeCell = new vscode.NotebookCellData(
        vscode.NotebookCellKind.Code,
        '',       // empty content
        'python'  // Set the primary language
    );

    const edit = new vscode.WorkspaceEdit();
    // Insert BOTH cells at the top. The metadata cell will be at index 0, the empty code cell at index 1.
    let notebookEdit = null;
    if (notebook.cellCount === 0) {
        notebookEdit = vscode.NotebookEdit.insertCells(0, [metadataCell, emptyCodeCell]);
    } else {
        notebookEdit = vscode.NotebookEdit.insertCells(0, [metadataCell]);
    }
    edit.set(notebook.uri, [notebookEdit]);
    
    const success = await vscode.workspace.applyEdit(edit);
    
    if (success) {
        processedNotebooks.add(notebookKey);
        console.log('Metadata added successfully');
    }
    
    return success;
}

// Track if we're currently updating to prevent save loops
const updatingNotebooks = new Set<string>();

export function activate(context: vscode.ExtensionContext) {
    console.log('Jupyter Notebook Auto Header extension is now active');

    const addMetadataCommand = vscode.commands.registerCommand(
        'jupyter-notebook-auto-header.addMetadata',
        async () => {
            const activeEditor = vscode.window.activeNotebookEditor;
            if (activeEditor && activeEditor.notebook.notebookType === 'jupyter-notebook') {
                const success = await addMetadataToNotebook(activeEditor.notebook);
                if (success) {
                    vscode.window.showInformationMessage('Metadata added to notebook!');
                } else {
                    vscode.window.showInformationMessage('Notebook already has metadata header.');
                }
            } else {
                vscode.window.showErrorMessage('Please open a Jupyter notebook first.');
            }
        }
    );

    const notebookOpenDisposable = vscode.workspace.onDidOpenNotebookDocument(async (notebook) => {
        if (notebook.notebookType === 'jupyter-notebook' && notebook.uri.scheme === 'file') {
            console.log(`Notebook opened: ${notebook.uri.fsPath}, cellCount: ${notebook.cellCount}`);
            
            setTimeout(async () => {
                await addMetadataToNotebook(notebook);
            }, 100);
        }
    });

    const notebookSaveDisposable = vscode.workspace.onDidSaveNotebookDocument(async (notebook) => {
        const notebookKey = notebook.uri.toString();
        
        if (notebook.notebookType === 'jupyter-notebook' && 
            !updatingNotebooks.has(notebookKey) && 
            hasMetadataCell(notebook)) {
            
            console.log(`Updating Last Modified for: ${notebook.uri.fsPath}`);
            updatingNotebooks.add(notebookKey);
            
            try {
                const firstCell = notebook.cellAt(0);
                const currentDateTime = getCurrentDateTime();
                const updatedValue = firstCell.document.getText().replace(
                    /Last Modified: .*/,
                    `Last Modified: ${currentDateTime}`
                );
                
                const updatedCellData = new vscode.NotebookCellData(
                    firstCell.kind,
                    updatedValue,
                    firstCell.document.languageId
                );
                updatedCellData.metadata = firstCell.metadata;

                const edit = new vscode.WorkspaceEdit();
                const notebookEdit = vscode.NotebookEdit.replaceCells(
                    new vscode.NotebookRange(0, 1),
                    [updatedCellData]
                );
                edit.set(notebook.uri, [notebookEdit]);
                
                await vscode.workspace.applyEdit(edit);
                
                setTimeout(async () => {
                    await notebook.save();
                    updatingNotebooks.delete(notebookKey);
                }, 100);
                
            } catch (error) {
                console.error('Error updating Last Modified:', error);
                updatingNotebooks.delete(notebookKey);
            }
        }
    });

    const notebookCloseDisposable = vscode.workspace.onDidCloseNotebookDocument((notebook) => {
        const notebookKey = notebook.uri.toString();
        processedNotebooks.delete(notebookKey);
        updatingNotebooks.delete(notebookKey);
    });

    context.subscriptions.push(addMetadataCommand);
    context.subscriptions.push(notebookOpenDisposable);
    context.subscriptions.push(notebookSaveDisposable);
    context.subscriptions.push(notebookCloseDisposable);
}

export function deactivate() {
    processedNotebooks.clear();
    updatingNotebooks.clear();
    console.log('Jupyter Notebook Auto Header extension is now deactivated');
}