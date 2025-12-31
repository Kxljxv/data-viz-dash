import { browser } from '$app/environment';

const translations = {
    de: {
        control_panel: {
            title: 'AEA Control',
            suite: 'Visualization Suite',
            tabs: {
                search: 'Suche',
                view: 'Ansicht',
                groups: 'Gruppen',
                info: 'Info'
            },
            menu_open: 'Menü öffnen',
            menu_close: 'Menü schließen'
        },
        status_bar: {
            nodes: 'Knoten',
            links: 'Links',
            filtered: 'Gefiltert',
            live: 'Live'
        },
        view_tab: {
            filters: 'Filter',
            representation: 'Darstellung',
            show_proposals: 'Anträge anzeigen',
            show_supporters: 'Unterstützer anzeigen',
            show_labels: 'Beschriftungen anzeigen',
            show_links: 'Verbindungen anzeigen',
            node_size: 'Knotengröße',
            reset_view: 'Ansicht zurücksetzen'
        }
    },
    en: {
        control_panel: {
            title: 'AEA Control',
            suite: 'Visualization Suite',
            tabs: {
                search: 'Search',
                view: 'View',
                groups: 'Groups',
                info: 'Info'
            },
            menu_open: 'Open menu',
            menu_close: 'Close menu'
        },
        status_bar: {
            nodes: 'Nodes',
            links: 'Links',
            filtered: 'Filtered',
            live: 'Live'
        },
        view_tab: {
            filters: 'Filters',
            representation: 'Representation',
            show_proposals: 'Show Proposals',
            show_supporters: 'Show Supporters',
            show_labels: 'Show Labels',
            show_links: 'Show Links',
            node_size: 'Node Size',
            reset_view: 'Reset View'
        }
    }
};

class I18n {
    locale = $state('de');

    constructor() {
        if (browser) {
            const savedLocale = localStorage.getItem('aea_locale');
            if (savedLocale) {
                this.locale = savedLocale;
            } else {
                const navLang = navigator.language.split('-')[0];
                if (translations[navLang]) {
                    this.locale = navLang;
                }
            }
        }
    }

    t(key) {
        const keys = key.split('.');
        let result = translations[this.locale];
        for (const k of keys) {
            if (result && result[k]) {
                result = result[k];
            } else {
                return key;
            }
        }
        return result;
    }

    setLocale(newLocale) {
        if (translations[newLocale]) {
            this.locale = newLocale;
            if (browser) {
                localStorage.setItem('aea_locale', newLocale);
            }
        }
    }
}

export const i18n = new I18n();
