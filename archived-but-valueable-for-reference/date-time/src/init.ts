const DEFAULT_LOCALE = "en-us";

const UNIVERSAL_PATTERNS = {
	D: "%m/%d/%y",
	F: "%Y-%m-%d",
	n: "\n",
	R: "%H:%M",
	T: "%H:%M:%S",
	["#T"]: "%#H:%M:%S",
	t: "\t",
	v: "%e-%b-%Y",
	["%"]: "%",
} as const;

type PatternDefinition = typeof UNIVERSAL_PATTERNS & {
	c: string;
	["#c"]: string;
	r: string;
	["#r"]: string;
	X: string;
	["#X"]: string;
	x: string;
	["#x"]: string;
};

interface Locale {
	DAY_NAMES: [string, string, string, string, string, string, string];
	DAY_NAMES_SHORT: [string, string, string, string, string, string, string];
	MONTH_NAMES: [string, string, string, string, string, string, string, string, string, string, string, string];
	MONTH_NAMES_SHORT: [string, string, string, string, string, string, string, string, string, string, string, string];
	SUFFIXES: [string, string, string];
	AM_PM: {
		LOWER: Map<boolean, string>;
		UPPER: Map<boolean, string>;
	};
	PATTERNS: PatternDefinition;
	FIRST_DAY_OF_WEEK: number;
}

function DeclareReplacePatterns(patterns: Omit<PatternDefinition, keyof typeof UNIVERSAL_PATTERNS>) {
	patterns = Object.assign(patterns, UNIVERSAL_PATTERNS);

	for (let [code, replacement] of Object.entries(patterns)) {
		while (true) {
			// Pre-optimize by evaluating recursive tags
			// e.g. "%#c" => "%#x, %#X" => "%A, %B %#d, %#Y, %#T" => "%A, %B %#d, %#Y, %#H:%M:%S"
			const previous = replacement;
			replacement = previous.gsub("%%(#?.)", patterns)[0];
			if (previous === replacement) break;
		}

		patterns[code] = replacement;
	}

	return patterns;
}

const LOCALES = {
	"en-us": {
		DAY_NAMES: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		DAY_NAMES_SHORT: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		MONTH_NAMES: [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		],
		MONTH_NAMES_SHORT: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		SUFFIXES: ["st", "nd", "rd"],
		AM_PM: {
			LOWER: new Map([
				[false, "am"],
				[true, "pm"],
			]),
			UPPER: new Map([
				[false, "AM"],
				[true, "PM"],
			]),
		},
		PATTERNS: DeclareReplacePatterns({
			c: "%a %b %e %X %Y",
			["#c"]: "%#x, %#X",
			r: "%I:%M:%S %p",
			["#r"]: "%#I:%M:%S %#p",
			X: "%T",
			["#X"]: "%#T",
			x: "%D",
			["#x"]: "%A, %B %#d, %#Y",
		}),
		FIRST_DAY_OF_WEEK: 0,
	} as Locale,
};

// interface DateTable {
// 	/** The year. */
// 	year: number;
// 	/** The month. [1, 12] */
// 	month: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
// 	/** The day. [1, 31] */
// 	day: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31;

// 	/** The hour. [0, 23] */
// 	hour?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;
// 	/** The minute. [0, 59] */
// 	min?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59;
// 	/** The second. [0, 59] */
// 	sec?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59;
// 	/** Whether this object represents a daylight savings time. */
// 	isdst?: boolean;
// 	/** The number of days into the year. [1, 366] */
// 	yday?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 | 124 | 125 | 126 | 127 | 128 | 129 | 130 | 131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 | 139 | 140 | 141 | 142 | 143 | 144 | 145 | 146 | 147 | 148 | 149 | 150 | 151 | 152 | 153 | 154 | 155 | 156 | 157 | 158 | 159 | 160 | 161 | 162 | 163 | 164 | 165 | 166 | 167 | 168 | 169 | 170 | 171 | 172 | 173 | 174 | 175 | 176 | 177 | 178 | 179 | 180 | 181 | 182 | 183 | 184 | 185 | 186 | 187 | 188 | 189 | 190 | 191 | 192 | 193 | 194 | 195 | 196 | 197 | 198 | 199 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 210 | 211 | 212 | 213 | 214 | 215 | 216 | 217 | 218 | 219 | 220 | 221 | 222 | 223 | 224 | 225 | 226 | 227 | 228 | 229 | 230 | 231 | 232 | 233 | 234 | 235 | 236 | 237 | 238 | 239 | 240 | 241 | 242 | 243 | 244 | 245 | 246 | 247 | 248 | 249 | 250 | 251 | 252 | 253 | 254 | 255 | 256 | 257 | 258 | 259 | 260 | 261 | 262 | 263 | 264 | 265 | 266 | 267 | 268 | 269 | 270 | 271 | 272 | 273 | 274 | 275 | 276 | 277 | 278 | 279 | 280 | 281 | 282 | 283 | 284 | 285 | 286 | 287 | 288 | 289 | 290 | 291 | 292 | 293 | 294 | 295 | 296 | 297 | 298 | 299 | 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 | 309 | 310 | 311 | 312 | 313 | 314 | 315 | 316 | 317 | 318 | 319 | 320 | 321 | 322 | 323 | 324 | 325 | 326 | 327 | 328 | 329 | 330 | 331 | 332 | 333 | 334 | 335 | 336 | 337 | 338 | 339 | 340 | 341 | 342 | 343 | 344 | 345 | 346 | 347 | 348 | 349 | 350 | 351 | 352 | 353 | 354 | 355 | 356 | 357 | 358 | 359 | 360 | 361 | 362 | 363 | 364 | 365 | 366;
// 	/** The day of the week. [1, 7] */
// 	wday?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
// }

type LocaleDateTable = Required<DateTable> & { locale: keyof typeof LOCALES };
type TagReplacerFunction = (t: LocaleDateTable) => string | number;

const getDay: TagReplacerFunction = (t) => t.day;
const getMonthShort: TagReplacerFunction = (t) => LOCALES[t.locale].MONTH_NAMES_SHORT[t.month - 1];
const getHour: TagReplacerFunction = (t) => t.hour;
const get12Hour: TagReplacerFunction = ({ hour }) => (hour > 12 ? hour - 12 : hour === 0 ? 12 : hour);

let TIME_ZONE_OFFSET: string;
let TIME_ZONE_OFFSET2: string;
{
	const dateDataUTC = os.date("!*t");
	const dateData = os.date("*t", os.time(dateDataUTC));
	const deviation = 60 * dateData.hour + dateData.min - (60 * dateDataUTC.hour + dateDataUTC.min);
	const absoluteDeviation = math.abs(deviation);

	TIME_ZONE_OFFSET2 = "%s%02d:%02d".format(deviation < 0 ? "-" : "+", absoluteDeviation / 60, absoluteDeviation % 60);
	TIME_ZONE_OFFSET = TIME_ZONE_OFFSET2.gsub(":", "", 1)[0];
}

function patternReplacer(replacement: keyof PatternDefinition): TagReplacerFunction {
	return (t: LocaleDateTable) => LOCALES[t.locale].PATTERNS[replacement].gsub("%%(#?.)", t as {})[0];
}

const TagReplacers = setmetatable(
	{
		// Sources:
		// https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man3/strftime.3.html
		// https://msdn.microsoft.com/en-us/library/fe06s4ak.aspx

		/** Full weekday name in the locale. */
		A: (t: LocaleDateTable) => LOCALES[t.locale].DAY_NAMES[t.wday - 1],

		/** Abbreviated weekday name in the locale. */
		a: (t: LocaleDateTable) => LOCALES[t.locale].DAY_NAMES_SHORT[t.wday - 1],

		/** Full month name in the locale. */
		B: (t: LocaleDateTable) => LOCALES[t.locale].MONTH_NAMES[t.month - 1],

		/** Abbreviated month name in the locale. */
		b: getMonthShort,

		/** The 2-digit year. */
		C: (t: LocaleDateTable) => "%02d".format(t.year / 100),

		/** The 4-digit year. */
		"#C": ({ year }: LocaleDateTable) => (year - (year % 100)) / 100,

		/** Date and time representation appropriate for locale. */
		c: patternReplacer("c"),

		/** Date and time representation appropriate for locale with `#` enabled where possible. */
		"#c": patternReplacer("#c"),

		/** Month/Day/Year */
		D: patternReplacer("D"),

		/** Day of month as 2-digit decimal number. [01, 31] */
		d: (t: LocaleDateTable) => "%02d".format(t.day),

		/** Day of month. [1, 31] */
		"#d": getDay,

		/** Day of month. [ 1, 31] */
		e: (t: LocaleDateTable) => "%2d".format(t.day),

		/** Day of month. [1, 31] */
		"#e": getDay,

		/** Year-month-day */
		F: patternReplacer("F"),

		/** The 4-digit year most days of this week are in. */
		G: (t: LocaleDateTable) => "%04d".format(TagReplacers["#G"](t)),

		/** The year most days of this week are in, with monday as the start of the week. ISO 8601 */
		"#G": (t: LocaleDateTable) => {
			// @returns TimeData.year + 0 if most days of this week are in this year
			// @returns TimeData.year + 1 if most days of this week are in next year
			// @returns TimeData.year - 1 if most days of this week are in last year

			const { yday, year } = t;
			const wday = t.wday === 1 ? 6 : t.wday - 2; // [0, 6] Monday as Beginning
			const MondayOfWeek = t.day - wday; // Get the TimeData.day of the first day of this week

			if (yday < 4) {
				return MondayOfWeek < -2 ? year - 1 : year;
			} else if (yday > 362) {
				return MondayOfWeek > 28 ? year + 1 : year;
			}

			return year;
		},

		/** The 2-digit year most days of this week are in, with monday as the start of the week. ISO 8601 */
		g: (t: LocaleDateTable) => "%02d".format(TagReplacers["#G"](t) % 100),

		/** The 4-digit year most days of this week are in, with monday as the start of the week. ISO 8601 */
		"#g": (t: LocaleDateTable) => TagReplacers["#G"](t) % 100,

		/** The 2-digit hour. [00, 23] */
		H: (t: LocaleDateTable) => "%02d".format(t.hour),

		/** The hour. [0, 23] */
		"#H": getHour,

		/** Abbreviated month name in the locale. */
		h: getMonthShort,

		/** The 2-digit hour. [01, 12] */
		I: (t: LocaleDateTable) => "%02d".format(get12Hour(t)),

		/** The hour. [1, 12] */
		"#I": get12Hour,

		/** The 3-digit day of the year. [001, 366] */
		j: (t: LocaleDateTable) => "%03d".format(t.yday),

		/** The day of the year. [1, 366] */
		"#j": (t: LocaleDateTable) => t.yday,

		/** The hour padded by spaces. [ 0, 23] */
		k: (t: LocaleDateTable) => "%2d".format(t.hour),

		/** The hour. [0, 23] */
		"#k": getHour,

		/** The hour padded with spaces. [ 1, 12] */
		l: (t: LocaleDateTable) => "%2d".format(get12Hour(t)),

		/** The hour. [1, 12] */
		"#l": get12Hour,

		/** The minute. [00, 59] */
		M: (t: LocaleDateTable) => "%02d".format(t.min),

		/** The minute. [0, 59] */
		"#M": (t: LocaleDateTable) => t.min,

		/** The 2-digit month. [01, 12] */
		m: (t: LocaleDateTable) => "%02d".format(t.month),

		/** The numeric month. [1, 12] */
		"#m": (t: LocaleDateTable) => t.month,

		/** A newline character. */
		n: patternReplacer("n"),

		/** AM/PM in the current locale. */
		p: (t: LocaleDateTable) => LOCALES[t.locale].AM_PM.UPPER.get(t.hour > 11),

		/** am/pm in the current locale. */
		"#p": (t: LocaleDateTable) => LOCALES[t.locale].AM_PM.LOWER.get(t.hour > 11),

		/** Equivalent to %H:%M */
		R: patternReplacer("R"),

		/** The locale's 12-hour clock time. */
		r: patternReplacer("r"),

		/** The locale's 12-hour clock time with padding disabled. */
		"#r": patternReplacer("#r"),

		/** The 2-digit number of seconds. [00, 59] */
		S: (t: LocaleDateTable) => "%02d".format(t.sec),

		/** The number of seconds. [0, 59] */
		"#S": (t: LocaleDateTable) => t.sec,

		/**
		 * The suffix in the current locale.
		 * Usually "st" | "nd" | "rd" | "th" for English.
		 * Should default to the empty string for non-applicable languages.
		 */
		s: (t: LocaleDateTable) => {
			const { day } = t;
			return (day < 21 && day > 3) || (day > 23 && day < 31) ? "th" : LOCALES[t.locale].SUFFIXES[day % 10];
		},

		/** Equivalent to %H:%M:%S, the ISO 8601 time format. */
		T: patternReplacer("T"),

		/** Equivalent to %#H:%M:%S, the ISO 8601 time format. */
		"#T": patternReplacer("#T"),

		/** A tab character. */
		t: patternReplacer("t"),

		/** 2-digit week of year, Sunday Based [00, 53] */
		U: (t: LocaleDateTable) => "%02d".format(1 + (t.yday - t.wday) / 7),

		/** Week of year, Sunday Based [0, 53] */
		"#U": (t: LocaleDateTable) => {
			const x = t.yday - t.wday;
			return 1 + (x - (x % 7)) / 7;
		},

		/** ISO 8601 weekday treating monday as the first day of the week [1, 7] */
		u: (t: LocaleDateTable) => (t.wday === 1 ? 7 : t.wday - 1),

		/**
		 * 2-digit week number of the year (Monday as the first day of the week). [01, 53]
		 * If the week containing January 1 has four or more days in the new year, then it
		 * is week 1; otherwise it is the last week of the previous year, and the next week is week 1
		 */
		V: (t: LocaleDateTable) => "%02d".format(TagReplacers["#V"](t)),

		/**
		 * Week number of the year (Monday as the first day of the week). [1, 53]
		 * If the week containing January 1 has four or more days in the new year, then it
		 * is week 1; otherwise it is the last week of the previous year, and the next week is week 1
		 */
		"#V": (t: LocaleDateTable) => error("%V not yet implemented"),
		/** Equivalent to %e-%b-%Y */
		v: patternReplacer("v"),

		/** 2-digit week of year treating monday as first day of week [00, 53] */
		W: (t: LocaleDateTable) => "%02d".format(TagReplacers["#W"](t)),

		/** Week of year treating monday as first day of week [0, 53] */
		"#W": (t: LocaleDateTable) => {
			const offset = t.wday - 2;
			const previousMonday = t.yday - (offset === -1 ? 6 : offset); // [0, 6]
			const divisible = previousMonday % 7;
			return divisible === 0 ? previousMonday / 7 : 1 + (previousMonday - divisible) / 7;
		},

		/** Weekday treating sunday as beginning. [0, 6] */
		w: (t: LocaleDateTable) => t.wday - 1,

		/** National time representation for the locale. */
		X: patternReplacer("X"),

		/** National time representation for the locale with padding removed. */
		"#X": patternReplacer("#X"),

		/** National date representation for the locale. */
		x: patternReplacer("x"),

		/** National date representation for the locale with padding removed. */
		"#x": patternReplacer("#x"),

		/** The year with century. [1000, 3000] */
		Y: (t: LocaleDateTable) => t.year,

		/** The 2-digit year (without the century) */
		y: (t: LocaleDateTable) => t.year % 100,

		/** Either the locale's time-zone name or time zone abbreviation, depending on registry settings; no characters if time zone is unknown */
		Z: () => error("[Date] Impossible to get timezone name without location", 2),

		/** The offset from UTC in format [+HH:MM]; no characters if time zone is unknown. */
		z: () => TIME_ZONE_OFFSET,

		/** The offset from UTC in format [-HHMM]; no characters if time zone is unknown. */
		"#z": () => TIME_ZONE_OFFSET2,

		/** A percent sign */
		"%": patternReplacer("%"),
	},
	{
		__index: (_, i: string) => error(`[Date] invalid tag: %%${i}`),
	},
);

type DoesPatternsImplementTagReplacers<T extends keyof typeof TagReplacers> = T;
type DoesPatternsImplementTagReplacersAssertion = DoesPatternsImplementTagReplacers<
	keyof typeof LOCALES[keyof typeof LOCALES]["PATTERNS"]
>;

const ReplaceIndexer = {
	__index: (a: LocaleDateTable, i: Exclude<keyof typeof TagReplacers, keyof LocaleDateTable>) => TagReplacers[i](a),
};

function formatDate(formatString?: string, unix?: number, locale: keyof typeof LOCALES = DEFAULT_LOCALE) {
	let timeData: Required<DateTable> & { locale?: "en-us" };
	if (formatString !== undefined && formatString.slice(0, 1) === "!") {
		timeData = os.date("!*t", unix);
		formatString = formatString.slice(1);
	} else timeData = os.date("!*t", unix);

	timeData.locale = locale;

	return formatString === "*t"
		? timeData
		: (formatString || "%c").gsub("%%(#?.)", setmetatable(timeData as LocaleDateTable, ReplaceIndexer) as {})[0];
}

interface Duration {
	days?: number;
	hours?: number;
	minutes?: number;
	seconds?: number;
}

interface DateChangeTable extends Duration {
	years?: number;
	months?: number;
	weeks?: number;
}

function printDateTable(dateTable: DateTable) {
	const largest: Array<keyof DateTable> = ["year", "month", "day", "hour", "min", "sec", "isdst", "wday", "yday"];

	// Object.entries(dateTable)
	// 	.sort(([a], [b]) => largest.indexOf(a) < largest.indexOf(b))
	// 	.forEach(([i, v]) => print(i, v));
}

export class DateTime {
	/** Ripped from `CorePackages.AppTempCommon.LuaChat.DateTime`. Experimental. */
	static getUTCOffset() {
		const day = 3;
		const actualEpoch = (day - 0.5) * 86400;
		const epoch = os.time({ year: 1970, month: 1, day });
		return actualEpoch - epoch;
	}

	/** Returns whether a given year is a leap year */
	static isLeapYear(year: number) {
		return year % 4 === 0 && (year % 25 !== 0 || year % 16 === 0);
	}

	/** An array which holds the length of each month, excluding leap days */
	private static readonly monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	static daysInMonth(month: number, year: number) {
		return month === 2 && DateTime.isLeapYear(year) ? 29 : DateTime.monthLengths[month - 1];
	}

	static fromObject(dateTable: Omit<DateTable, "day"> & { day?: number } & { formatString: "*t" | "!*t" }): DateTime;
	static fromObject(dateTable: Omit<DateTable, "day"> & { day?: number }, formatString?: "*t" | "!*t"): DateTime;
	static fromObject(dateTable: Omit<DateTable, "day"> & { day?: number } & { formatString: "*t" | "!*t" }) {
		const { day = 1 } = dateTable;
		return new DateTime(os.time(Object.assign(dateTable, { day }) as DateTable));
	}

	/** Finds the first occuring date in a series. Similar to `math.min`. */
	static getFirst(...dates: Array<DateTime>) {
		return dates.reduce((p, c) => (p.unix < c.unix ? p : c));
	}

	/** Finds the last occuring date in a series. Similar to `math.max`. */
	static getLast(...dates: Array<DateTime>) {
		return dates.reduce((p, c) => (p.unix > c.unix ? p : c));
	}

	static now() {
		return new DateTime(undefined, false);
	}

	static utc() {
		return new DateTime();
	}

	//  "Utc"|"Local"

	public readonly timeData: LocaleDateTable;

	/** The seconds since Jan 1, 1970, adjusted to UTC */
	readonly unix: number;

	/**
	 *
	 * @param seconds The number of seconds since Jan 1, 1970
	 * @param utc true if `seconds` represents the UTC timezone, false if it represents the local timezone
	 * @param locale
	 */
	constructor(seconds?: number, utc = true, locale: keyof typeof LOCALES = DEFAULT_LOCALE) {
		const dateTable = os.date(utc ? "!*t" : "*t", seconds);
		this.unix = os.time(dateTable);
		this.timeData = Object.assign(dateTable, { locale });
	}

	get<T extends keyof LocaleDateTable>(unit: T) {
		return this.timeData[unit];
	}

	set(unit: Partial<LocaleDateTable>) {
		return new DateTime(os.time(Object.assign(this.toObject(), unit)));
	}

	easter() {
		const { year } = this.timeData;
		const a = math.floor(year / 100) * 1483 - math.floor(year / 400) * 2225 + 2613;
		const b = math.floor(((year % 19) * 3510 + math.floor(a / 25) * 319) / 330) % 29;
		const c = 148 - b - ((math.floor(year * 1.25) + a - b) % 7);
		return new DateTime(os.time({ year, month: math.floor(c / 31), day: (c % 31) + 1 }));
	}

	/** Adds units of time to this date object. */
	plus({ years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0 }: DateChangeTable) {
		const { timeData: dateTable } = this;
		let year = dateTable.year + years;
		let month = dateTable.month + months;
		if (month > 12) year += (month - (month = month % 12)) / 12;

		if (month > 12) month -= 12 * (year += math.floor(month / 12));

		return new DateTime(
			os.time({ year, month, day: dateTable.day }) +
				((((weeks * 7 + days) * 24 + hours) * 60 + minutes) * 60 + seconds),
		);
	}

	/** Subtracts units of time from this date object. */
	minus({ years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0 }: DateChangeTable) {
		const { timeData: dateTable } = this;
		let year = dateTable.year - years;
		let month = dateTable.month - months;

		if (month < 1) year -= (month - (month = ((month - 1) % 12) + 1) - 2) / 12;

		return new DateTime(
			os.time({ year, month, day: dateTable.day }) -
				((((weeks * 7 + days) * 24 + hours) * 60 + minutes) * 60 + seconds),
		);
	}

	/** Returns a new DateTime object which is the same as this one, but set to the beginning of the unit passed in. */
	startOf(unit: "year" | "month" | "week" | "day" | "hour" | "min") {
		const dateTable = this.toObject();

		if (unit === "week") {
			// for now assumes that sunday is the first day of the week
			dateTable.day -= dateTable.wday - 1;
			unit = "day";
		}

		switch (unit) {
			case "year":
				dateTable.month = 1;
			case "month":
				dateTable.day = 1;
			case "day":
				dateTable.hour = 0;
			case "hour":
				dateTable.min = 0;
			case "min":
				dateTable.sec = 0;
		}

		return new DateTime(os.time(dateTable));
	}

	endOf(unit: "year" | "month" | "week" | "day" | "hour" | "min") {
		const dateTable = this.toObject();

		if (unit === "week") {
			// for now assumes that sunday is the first day of the week
			dateTable.day += 7 - dateTable.wday;
			unit = "day";
		}

		switch (unit) {
			case "year":
				dateTable.month = 12;
			case "month":
				dateTable.day = DateTime.daysInMonth(dateTable.month, dateTable.year);
			case "day":
				dateTable.hour = 23;
			case "hour":
				dateTable.min = 59;

			case "min":
				dateTable.sec = 59;
		}

		return new DateTime(os.time(dateTable));
	}

	/** Converts this DateTime into a new DateTable. */
	toObject() {
		return Object.copy(this.timeData);
	}

	toString(formatString = "%A, %B %#d, %Y at %X %p"): string {
		const formattedDate = formatDate("!" + formatString, this.unix);

		return typeIs(formattedDate, "string")
			? formattedDate
			: game.GetService("HttpService").JSONEncode(formattedDate);
	}

	/** Returns the number of seconds since Jan 1, 1970 in the UTC time-zone. */
	valueOf(): number {
		return this.unix;
	}

	isInLeapYear() {
		return DateTime.isLeapYear(this.timeData.year);
	}

	// Gets the week number we are in. [1, 53]
	getWeekNumber() {
		return;
	}
}

const prototype = (DateTime as unknown) as typeof DateTime.prototype;

print(new DateTime());

// Create an event that runs during the month of December 2020
const eventStart = DateTime.fromObject({ month: 12, year: 2020 });
const eventEnd = eventStart.endOf("month");

print(`EVENT START: ${eventStart}`); // calls `tostring(eventStart)`, which calls eventStart.toString()
print(`EVENT END: ${eventEnd}`);

// Create an object for the current date and time (default), which we can compare with event DateTimes
const current = new DateTime();

// if (eventStart <= current && current <= eventEnd) {
// 	print("EVENT ONGOING");
// } else {
// 	print("EVENT ENDED");
// }

new DateTime().plus({ years: 1 });
new DateTime().plus({ months: 1 });

function f(a: number | string, b: string) {
	if (a < b) print("bad!");
}

type X = DateTime["valueOf"];
DateTime.fromObject({
	month: 1,
	year: 2020,
});

// Easter event
print(new DateTime().easter().toString());
