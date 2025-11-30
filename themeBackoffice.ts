import { createTheme } from 'flowbite-react';

const themeBackoffice = createTheme({
  card: {
    root: {
      base: 'flex rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md',
      children: 'flex h-full flex-col justify-start gap-4 p-6',
    },
  },
  button: {
    base: 'group relative flex items-center justify-center rounded-lg text-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    disabled: 'cursor-not-allowed opacity-50',
    color: {
      blue: 'bg-bo-primary text-white shadow-sm hover:bg-bo-primary-hover hover:shadow-md focus:ring-bo-primary',
      light:
        'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 focus:ring-bo-primary',
      gray: 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:ring-slate-400',
      failure:
        'bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-md focus:ring-red-500',
      success:
        'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:shadow-md focus:ring-emerald-500',
      warning:
        'bg-bo-secondary text-white shadow-sm hover:bg-bo-secondary-dark hover:shadow-md focus:ring-bo-secondary',
      purple:
        'bg-bo-primary text-white shadow-sm hover:bg-bo-primary-hover hover:shadow-md focus:ring-bo-primary',
      menu: 'w-full justify-start rounded-lg bg-transparent text-slate-700 font-medium hover:bg-slate-100 transition-all duration-200 focus:ring-bo-primary',
    },
    size: {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base',
      xl: 'px-6 py-3.5 text-base',
    },
  },
  table: {
    root: {
      base: 'w-full text-left text-sm',
      shadow: '',
      wrapper: 'relative overflow-x-auto rounded-lg',
    },
    head: {
      base: 'group/head text-xs uppercase',
      cell: {
        base: 'bg-slate-50 px-6 py-4 font-bold text-slate-600 tracking-wider',
      },
    },
    body: {
      base: 'group/body divide-y divide-slate-200 bg-white',
      cell: {
        base: 'px-6 py-4',
      },
    },
    row: {
      base: 'group/row transition-colors duration-150',
      hovered: 'hover:bg-slate-50',
      striped: 'odd:bg-white even:bg-slate-50',
    },
  },
  modal: {
    root: {
      base: 'fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full',
      show: {
        on: 'flex bg-slate-900/50 backdrop-blur-sm',
        off: 'hidden',
      },
      sizes: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
      },
      positions: {
        center: 'items-center justify-center',
      },
    },
    content: {
      base: 'relative h-full w-full p-4 md:h-auto',
      inner:
        'relative flex max-h-[90vh] flex-col rounded-xl bg-white shadow-2xl',
    },
    body: {
      base: 'flex-1 overflow-auto p-6',
    },
    header: {
      base: 'flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-slate-50 p-5',
      title: 'text-xl font-bold text-slate-900',
      close: {
        base: 'ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-colors',
        icon: 'h-5 w-5',
      },
    },
    footer: {
      base: 'flex items-center gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50 p-6',
    },
  },
  textInput: {
    base: 'flex',
    field: {
      base: 'relative w-full',
      input: {
        base: 'block w-full rounded-lg border shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        sizes: {
          sm: 'p-2 text-sm',
          md: 'p-2.5 text-sm',
          lg: 'p-3.5 text-base',
        },
        colors: {
          gray: 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-bo-primary focus:ring-2 focus:ring-bo-primary/20',
          info: 'border-bo-primary bg-bo-primary-light text-purple-900 placeholder-purple-600 focus:border-bo-primary focus:ring-2 focus:ring-bo-primary/20',
          failure:
            'border-red-400 bg-red-50 text-red-900 placeholder-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20',
          warning:
            'border-bo-secondary bg-bo-secondary-light text-orange-900 placeholder-orange-600 focus:border-bo-secondary focus:ring-2 focus:ring-bo-secondary/20',
          success:
            'border-emerald-400 bg-emerald-50 text-emerald-900 placeholder-emerald-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
        },
      },
    },
  },
  label: {
    root: {
      base: 'mb-2 block text-sm font-semibold',
      colors: {
        default: 'text-slate-700',
        info: 'text-cyan-700',
        failure: 'text-red-700',
        warning: 'text-amber-700',
        success: 'text-emerald-700',
      },
    },
  },
  spinner: {
    base: 'inline animate-spin',
    color: {
      failure: 'fill-red-600',
      gray: 'fill-slate-600',
      info: 'fill-bo-primary',
      success: 'fill-emerald-600',
      warning: 'fill-bo-secondary',
    },
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-10 w-10',
    },
  },
});

export default themeBackoffice;
