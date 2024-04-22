import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, editorEditorField } from 'obsidian';

export default class QuickVerseLink extends Plugin {
	async onload() {
		console.log('loading Quick Verse Link plugin')
		// this adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'quick-verse-link',
			name: 'Quick Verse Link',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				this.openPrompt(editor)
			}
		});
		this.addCommand({
			id: 'insert-paragraph-symbol',
			name: 'Insert Paragraph Symbol in Link',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				this.insertParagraphSymbol(editor);

			}
		});




		// if the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// when registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	openPrompt(editor: Editor) {
		const modal = new VerseModal(this.app, editor);
		modal.open();
	}

	insertParagraphSymbol(editor: Editor) {
		const cursor = editor.getCursor();
		const line = cursor.line;

		const lineText = editor.getLine(line);

		const linkRegex = /\[\[[^\]]+\]\]/g;
		let newText = lineText;

		let match;
		while ((match = linkRegex.exec(lineText)) !== null) {
			const linkStart = match.index;
			const linkEnd = match.index + match[0].length;
			if (cursor.ch >= linkStart && cursor.ch <= linkEnd) {
				const linkText = lineText.substring(linkStart, linkEnd);
				const replacedLinkText = linkText.replace(/#(?=[^\]]*?\])/g, '#¶ ');
				newText = newText.substring(0, linkStart) + replacedLinkText + newText.substring(linkEnd);
			}
		}

		if (newText !== lineText) {
			editor.replaceRange(newText, { line: line, ch: 0 }, { line: line, ch: lineText.length });
		}
	}
}



class VerseModal extends Modal {
	editor: Editor
	onSubmit: (result: string) => void;
	constructor(app: App, editor: Editor) {
		super(app);
		this.editor = editor
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h5', { text: 'Enter verse reference' });
		contentEl.style.marginTop = '-16px';

		const inputEl = contentEl.createEl('input');
		inputEl.type = 'text';
		inputEl.placeholder = 'Example: 2cor4 16 18 → 2 Corinthians 4:16-18';
		inputEl.style.width = '100%';
		inputEl.style.margin = 'auto';


		inputEl.addEventListener('keydown', async (event) => {
			if (event.key === 'Enter') {
				event.preventDefault(); // Prevent the default behavior
				const verseRef = inputEl.value;
				await this.insertVerseLink(verseRef);
				this.close();
			}
		});

	}

	async insertVerseLink(verseRef: string) {
		console.log('inserting verse link');
		const shortArr1 = ['gen', 'ex', 'lev', 'num', 'deut', 'josh', 'judg', 'ruth', '1sam', '2sam', '1kings', '2kings', '1chron', '2chron', 'ezra', 'neh', 'est', 'job', 'ps', 'prov', 'eccles', 'song', 'isa', 'jer', 'lam', 'ezek', 'dan', 'hos', 'joel', 'amos', 'obad', 'jonah', 'mic', 'nah', 'hab', 'zeph', 'hag', 'zech', 'mal', 'matt', 'mark', 'luke', 'john', 'acts', 'rom', '1cor', '2cor', 'gal', 'eph', 'phil', 'col', '1thess', '2thess', '1tim', '2tim', 'titus', 'philem', 'heb', 'james', '1pet', '2pet', '1john', '2john', '3john', 'jude', 'rev'];
		const shortArr2 = ['ge', 'exod', 'le', 'nu', 'de', 'jos', 'jdg', 'rth', '1sm', '2sm', '1kgs', '2kgs', '1chr', '2chr', 'ezr', 'ne', 'est', 'jb', 'psalm', 'pro', 'eccle', 'sos', 'is', 'je', 'la', 'eze', 'da', 'ho', 'jl', 'am', 'ob', 'jnh', 'mc', 'na', 'hb', 'zep', 'hg', 'zec', 'ml', 'mt', 'mrk', 'luk', 'joh', 'act', 'ro', '1co', '2co', 'ga', 'ephes', 'php', 'co', '1thes', '2thes', '1ti', '2ti', 'tit', 'phm', '', 'jas', '1pe', '2pe', '1jhn', '2jhn', '3jhn', 'jud', 're'];
		const shortArr3 = ['gn', 'exo', 'lv', 'nm', 'dt', 'jsh', 'jg', 'ru', '1sa', '2sa', '1ki', '2ki', '1ch', '2ch', 'ez', '', 'es', '', 'pslm', 'prv', 'ecc', 'so', '', 'jr', '', 'ezk', 'dn', '', '', '', '', 'jon', '', '', '', 'zp', '', 'zc', '', 'mt', 'mar', 'lk', 'jhn', 'ac', 'rm', '', '', '', '', 'pp', '', '1th', '2th', '', '', 'ti', 'pm', '', 'jm', '1pt', '2pt', '1jn', '2jn', '3hn', 'jd', ''];
		const shortArr4 = ['', '', '', 'nb', '', '', 'jdgs', '', '1s', '2s', '1k', '2k', '', '', '', '', '', '', 'psa', 'pr', 'ec', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'mk', '', 'jn', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '1p', '2p', '1j', '2j', '3j', '', ''];
		const longArr = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];

		// extract book, chapter, and verse from input
		const matchBook = verseRef.match(/[vw;:\- ]*([1-3]* *[a-z]+)[;:\- ]*$/);
		const matchChapter = verseRef.match(/[vw;:\- ]*([1-3]* *[a-z]+)[;:\- ]*([0-\9]+)[;:\- ]*$/);
		const matchVerse = verseRef.match(/[vw;:\- ]*([1-3]* *[a-z]+)[;:\- ]*([0-9]+)[;:\- ]+([0-9]+)[;:\- ]*$/);
		const matchSection = verseRef.match(/[vw;:\- ]*([1-3]* *[a-z]+)[;:\- ]*([0-9]+)[;:\- ]+([0-9]+)[;:\- ]+([0-9]+)[;:\- ]*$/);

		const vMatchChapter = verseRef.match(/[;:\- ]*v[;:\- ]*([1-3]* *[a-z]+)[;:\- ]*([0-\9]+)[;:\- ]*$/);
		const VMatchChapter = verseRef.match(/[;:\- ]*V[;:\- ]*([1-3]* *[a-z]+)[;:\- ]*([0-\9]+)[;:\- ]*$/);
		const vMatchVerse = verseRef.match(/[;:\- ]*v[;:\- ]*([1-3]* *[a-z]+)[;:\- ]*([0-9]+)[;:\- ]+([0-9]+)[;:\- ]*$/);
		const vMatchSection = verseRef.match(/[;:\- ]*v[;:\- ]*([1-3]* *[a-z]+)[;:\- ]*([0-9]+)[;:\- ]+([0-9]+)[;:\- ]+([0-9]+)[;:\- ]*$/);
		const VMatchVerse = verseRef.match(/[;:\- ]*V[;:\- ]*([1-3]* *[a-z]+)[;:\- ]*([0-9]+)[;:\- ]+([0-9]+)[;:\- ]*$/);
		const VMatchSection = verseRef.match(/[;:\- ]*V[;:\- ]*([1-3]* *[a-z]+)[;:\- ]*([0-9]+)[;:\- ]+([0-9]+)[;:\- ]+([0-9]+)[;:\- ]*$/);

		const wMatchVerse = verseRef.match(/[;:\- ]*w[;:\- ]*([1-3]* *[a-z]+)[;:\- ]*([0-9]+)[;:\- ]+([0-9]+)[;:\- ]*$/);
		const wMatchSection = verseRef.match(/[;:\- ]*w[;:\- ]*([1-3]* *[a-z]+)[;:\- ]*([0-9]+)[;:\- ]+([0-9]+)[;:\- ]+([0-9]+)[;:\- ]*$/);

		let match = matchBook;
		if (!matchBook) {
			match = matchChapter;
			if (!matchChapter) {
				match = matchVerse;
				if (!matchVerse) {
					match = matchSection;
					if (!matchSection) {
						new Notice('Invalid verse reference format.');
						return '';
					}
				}
			}
		}
		if (match) {
			// find book name
			let shortBook = match[1].toLowerCase();
			let longBook = '';
			for (let i = 0; i < 66; i++) {
				if (shortBook === shortArr1[i] || shortBook === shortArr2[i] || shortBook === shortArr3[i] || shortBook === shortArr4[i] || shortBook === longArr[i]) {
					shortBook = shortArr1[i];
					longBook = longArr[i];
					break;
				}
			}
			// Construct verse link
			let link: string = '';
			// Use expansion to construct the link
			if (matchBook) {
				link = `[[${shortBook}|${longBook}]]`;
			}
			if (matchChapter) {
				const chapter = matchChapter[2];
				if (!vMatchChapter && !VMatchChapter) {
					link = `[[${shortBook}${chapter}|${longBook} ${chapter}]]`;
				} else if (vMatchChapter) {
					link = `[[${shortBook}${chapter}|chapter ${chapter}]]`;
				} else if (VMatchChapter) {
					link = `[[${shortBook}${chapter}|Chapter ${chapter}]]`;
				}
			} else if (matchVerse) {
				const chapter = matchVerse[2];
				const verse = matchVerse[3];
				if (!vMatchVerse && !VMatchVerse && !wMatchVerse) {
					link = `[[${shortBook}${chapter}#${verse}|${longBook} ${chapter}:${verse}]]`;
				} else if (vMatchVerse) {
					link = `[[${shortBook}${chapter}#${verse}|verse ${verse}]]`;
				} else if (VMatchVerse) {
					link = `[[${shortBook}${chapter}#${verse}|Verse ${verse}]]`;
				} else if (wMatchVerse) {
					link = `[[${shortBook}${chapter}#${verse}|${chapter}:${verse}]]`;
				}
			} else if (matchSection) {
				const chapter = matchSection[2];
				const verse = matchSection[3];
				const verseLast = matchSection[4];
				if (!vMatchSection && !VMatchSection && !wMatchSection) {
					link = `[[${shortBook}${chapter}#${verse}|${longBook} ${chapter}:${verse}-${verseLast}]]`;
				} else if (vMatchSection) {
					link = `[[${shortBook}${chapter}#${verse}|verses ${verse}-${verseLast}]]`;
				} else if (VMatchSection) {
					link = `[[${shortBook}${chapter}#${verse}|Verses ${verse}-${verseLast}]]`;
				} else if (wMatchSection) {
					link = `[[${shortBook}${chapter}#${verse}|${chapter}:${verse}-${verseLast}]]`;
				}
			}
			// Print verse link
			this.editor.replaceSelection(link);
		}
	}

	onClose() {
		const { contentEl } = this;
		// let { contentEl } = this;
		contentEl.empty();
	}
}
