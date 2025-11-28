import { createTheme } from 'flowbite-react';

const themeVG = createTheme({
  card: {
    root: {
      base: 'flex rounded-lg border border-gray-800 bg-gray-800 text-white shadow-md',
      children: 'flex h-full flex-col justify-center gap-4 p-6',
      horizontal: {
        off: 'flex-col',
        on: 'flex-col md:max-w-xl md:flex-row',
      },
      href: 'hover:bg-gray-100',
    },
    img: {
      base: '',
      horizontal: {
        off: 'rounded-t-lg',
        on: 'h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg',
      },
    },
  },
  alert: {
    base: 'flex flex-col gap-2 p-4 text-xs',
    borderAccent: 'border-t-4',
    closeButton: {
      base: '-m-1.5 ml-auto inline-flex h-8 w-8 rounded-lg p-1.5 focus:ring-2',
      icon: 'h-5 w-5',
      color: {
        info: 'bg-cyan-100 text-cyan-500 hover:bg-cyan-200 focus:ring-cyan-400 ',
        gray: 'bg-gray-100 text-gray-500 hover:bg-gray-200 focus:ring-gray-400 ',
        failure: 'bg-red-100 text-red-500 hover:bg-red-200 focus:ring-red-400 ',
        success:
          'bg-green-100 text-green-500 hover:bg-green-200 focus:ring-green-400 ',
        warning:
          'bg-yellow-100 text-yellow-500 hover:bg-yellow-200 focus:ring-yellow-400 ',
      },
    },
    color: {
      info: 'border-cyan-500 bg-cyan-100 text-cyan-700 ',
      gray: 'border-gray-500 bg-gray-100 text-gray-700',
      failure: 'border-red-500 bg-red-100 text-red-700 ',
      success: 'border-green-500 bg-green-100 text-green-700 ',
      warning: 'border-yellow-500 bg-yellow-100 text-yellow-700 ',
    },
    icon: 'mr-3 inline h-5 w-5 shrink-0',
    rounded: 'rounded-lg',
    wrapper: 'flex items-center',
  },
  dropdown: {
    arrowIcon: 'ml-2 h-4 w-4',
    content: 'py-1 focus:outline-none',
    floating: {
      animation: 'transition-opacity',
      arrow: {
        base: 'absolute z-10 h-2 w-2 rotate-45',
        style: {
          light: 'bg-white',
        },
        placement: '-4px',
      },
      base: 'z-10 w-fit divide-y divide-gray-100 rounded shadow-none focus:outline-none',
      content: 'py-1 text-sm text-primaryDark ',
      divider: 'my-1 h-px bg-primaryLight',
      header: 'block px-4 py-2 text-sm text-primaryDark',
      hidden: 'invisible opacity-0',
      item: {
        container: '',
        base: 'flex w-full cursor-pointer items-center justify-start px-4 py-2 text-sm text-primaryDark hover:bg-primaryLight focus:bg-primaryLight focus:outline-none',
        icon: 'mr-2 h-4 w-4',
      },
      style: {
        light: 'border border-primaryLight bg-white text-primaryDark',
      },
      target: 'w-fit',
    },
    inlineWrapper: 'flex items-center cursor-pointer',
  },
  button: {
    base: 'relative flex items-center justify-center rounded-2xl text-center font-bold uppercase focus:outline-none focus:ring-0 cursor-pointer',
    disabled:
      'pointer-events-auto opacity-50 cursor-not-allowed disabled:hover:bg-primary disabled:hover:text-primaryDark',
    color: {
      default:
        'bg-primary text-primaryDark hover:bg-secondary hover:text-white ',
      active: 'bg-secondary text-white hover:bg-secondary hover:text-white',
      light:
        'bg-cancel text-secondary border-cancel hover:bg-cancel hover:text-white',
      link: 'bg-transparent text-secondary underline hover:text-primary hover:no-underline focus:ring-0',
      menu: 'bg-transparent text-white hover:border hover:border-secondary',
    },
    outlineColor: {
      default:
        'border border-primary text-primaryDark hover:border-primary hover:bg-primary hover:text-primaryDark focus:ring-none',
    },
    size: {
      md: 'h-7.5 px-5 py-1 text-xs font-medium rounded-full',
      lg: 'h-10 px-7 py-3 text-sm font-medium rounded-full',
    },
  },
  modal: {
    root: {
      base: 'fixed inset-x-0 top-0 z-50 h-screen overflow-y-scroll overflow-x-hidden md:inset-0 md:h-full',
      show: {
        on: 'flex bg-gray-900/50',
        off: 'hidden',
      },
      sizes: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
      },
      positions: {
        'top-left': 'items-start justify-start',
        'top-center': 'items-start justify-center',
        'top-right': 'items-start justify-end',
        'center-left': 'items-center justify-start',
        center: 'items-center justify-center',
        'center-right': 'items-center justify-end',
        'bottom-right': 'items-end justify-end',
        'bottom-center': 'items-end justify-center',
        'bottom-left': 'items-end justify-start',
      },
    },
    content: {
      base: 'relative h-full w-full p-4 md:h-auto',
      inner: 'relative flex max-h-[90dvh] flex-col rounded-lg !bg-white shadow',
    },
    body: {
      base: 'flex-1 overflow-auto py-10 text-sm !bg-white !text-gray-900',
      popup: 'pt-0',
    },
    header: {
      base: 'flex items-center justify-start rounded-t border-b-0 px-14 bg-primary !text-primaryDark',
      popup: 'border-b-0 p-2',
      title: 'text-[27px] text-start !text-primaryDark',
      close: {
        base: 'ml-auto hidden items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 focus:ring-0',
        icon: 'h-5 w-5',
      },
    },
    footer: {
      base: 'flex items-center space-x-2 rounded-b border-gray-200 p-8 !bg-white',
      popup: 'border-none',
    },
  },
  radio: {
    base: 'h-4 w-4 appearance-none rounded-full border border-primary bg-white bg-[length:1em_1em] bg-center bg-no-repeat checked:border-transparent checked:bg-current checked:bg-dot-icon focus:outline-none focus:ring-0',
    color: {
      default: 'text-secondary',
    },
  },
  select: {
    addon:
      'inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-primaryLight',
    base: 'flex',
    field: {
      base: 'relative w-full',
      icon: {
        base: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2',
        svg: 'h-5 w-5 text-primary',
      },
      select: {
        base: 'block cursor-pointer w-full appearance-none bg-arrow-down-icon bg-[length:0.75em_0.75em] bg-[position:right_12px_center] bg-no-repeat pr-1',
        colors: {
          default:
            'text-primaryDark border border-primary bg-white placeholder-primaryInactive focus:border-primary focus:ring-primary placeholder:tracking-widest',

          gray: 'text-secondary  border-0 bg-white/90 focus:border-primary focus:ring-primary',
          failure:
            'border-red-500 text-red-700 focus:ring-red-500 focus:border-red-500',
          placeholder:
            'text-primaryLight tracking-extra-widest border-0 bg-white/90 placeholder-primaryLight placeholder:tracking-extra-widest focus:border-primary focus:ring-primary',
        },
        sizes: {
          sm: 'px-6 py-1 text-xs',
          md: 'ps-4 pe-12 py-2 text-sm',
          lg: 'px-6 py-2 text-md',
        },
        withAddon: {
          off: 'rounded-md',
          on: 'rounded-r-lg',
        },
      },
    },
  },
  spinner: {
    color: {
      default: 'fill-primaryDark',
    },
  },
  textInput: {
    base: 'flex',
    addon:
      'inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 ',
    field: {
      base: 'relative w-full',
      icon: {
        base: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
        svg: 'h-5 w-5 text-gray-500',
      },
      rightIcon: {
        base: 'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3',
        svg: 'h-5 w-5 text-gray-500',
      },
      input: {
        base: 'block w-full border focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 !bg-white !text-gray-900',
        sizes: {
          sm: 'p-2 text-sm',
          md: 'p-3 text-md',
          lg: 'p-4 sm:text-base',
        },
        colors: {
          default:
            'border-primary !bg-white !text-primaryDark placeholder-primaryInactive focus:border-primary focus:ring-0',

          gray: 'border-gray-300 !bg-gray-50 !text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-0',
          info: 'border-cyan-500 !bg-cyan-50 !text-cyan-900 placeholder-cyan-700 focus:border-cyan-500 focus:ring-0',
          failure:
            'border-red-500 !bg-red-50 !text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-0',
          warning:
            'border-yellow-500 !bg-yellow-50 !text-yellow-900 placeholder-yellow-700 focus:border-yellow-500 focus:ring-0',
          success:
            'border-green-500 !bg-green-50 !text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-0',
        },
        withRightIcon: {
          on: 'pr-10',
          off: '',
        },
        withIcon: {
          on: 'pl-3',
          off: '',
        },
        withAddon: {
          on: 'rounded-r-lg',
          off: 'rounded-md',
        },
        withShadow: {
          on: 'shadow-sm',
          off: '',
        },
      },
    },
  },
});

export default themeVG;
