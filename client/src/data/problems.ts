export type Problem = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  minutes: number;
  tags: string[];
  statement: string;
  requirements: string[];
  starter: string;
};

export const PROBLEMS: Problem[] = [
  {
    id: "bank-account",
    title: "Bank Account",
    difficulty: "Easy",
    minutes: 25,
    tags: ["state", "validation"],
    statement:
      "Design an Account class for a simple bank. An account has an owner name, a balance, and a transaction history. Customers can deposit, withdraw, transfer money to another account, and view their history.",
    requirements: [
      "Constructor takes an owner name and optional starting balance (default 0)",
      "deposit(amount) and withdraw(amount) raise on non-positive amounts",
      "withdraw raises on insufficient funds",
      "transfer(amount, other) moves money to another account as one logical transaction",
      "history() returns transactions in reverse chronological order",
      "Implement __repr__ for friendly debugging output",
    ],
    starter: "class Account:\n    pass\n",
  },
  {
    id: "url-shortener",
    title: "URL Shortener",
    difficulty: "Easy",
    minutes: 25,
    tags: ["state", "encapsulation"],
    statement:
      "Build a URLShortener that turns long URLs into short codes and tracks usage. Users can let the system generate a code or supply a custom alias.",
    requirements: [
      "shorten(url, alias=None) returns a short code (6 chars if auto-generated)",
      "Custom aliases must be unique — raise on collision",
      "expand(code) returns the original URL and increments a click counter",
      "expand on an unknown code raises",
      "stats(code) returns the click count for that code",
      "Two calls to shorten with the same URL but no alias may return different codes",
    ],
    starter: "class URLShortener:\n    pass\n",
  },
  {
    id: "vending-machine",
    title: "Vending Machine",
    difficulty: "Medium",
    minutes: 35,
    tags: ["state machine", "inventory"],
    statement:
      "Build a VendingMachine that holds stock, accepts coins, and dispenses items with change.",
    requirements: [
      "stock(name, price_cents, quantity) adds or updates an item",
      "insert_coin(value) accepts 5, 10, 25, or 100 cents — anything else raises",
      "select(name) dispenses the item if affordable and in stock, returns change as a list of coins (largest first)",
      "select raises if out of stock or if credit is insufficient",
      "cancel() returns all inserted coins and resets credit to zero",
      "available_items() returns list of (name, price, quantity) for items still in stock",
    ],
    starter: "class VendingMachine:\n    pass\n",
  },
  {
    id: "parking-lot",
    title: "Parking Lot",
    difficulty: "Medium",
    minutes: 35,
    tags: ["polymorphism", "composition"],
    statement:
      "Design a parking lot. Three vehicle types: Motorcycle, Car, Truck. Three spot sizes: Small, Medium, Large. Motorcycles fit any spot. Cars need Medium or Large. Trucks need Large. The lot charges hourly rates that vary by spot size.",
    requirements: [
      "Construct a Lot with counts of each spot size and hourly rates per spot size",
      "park(vehicle) returns a Ticket (with id, spot, entry_time); raises if no spot fits",
      "leave(ticket, now) frees the spot and returns the fee (round up to next hour)",
      "available() returns a dict of spot_size → free_count",
      "Use a class per vehicle type, or a single class with a type field — defend your choice",
    ],
    starter: "# Define vehicles and the Lot.\n",
  },
  {
    id: "event-calendar",
    title: "Event Calendar",
    difficulty: "Medium",
    minutes: 35,
    tags: ["datetime", "querying"],
    statement:
      "Build a Calendar that holds events and supports conflict-free scheduling and free-slot queries.",
    requirements: [
      "add(title, start, end) creates an event; raises if it overlaps any existing event (touching at endpoints is OK)",
      "Each event has a unique id, returned from add",
      "cancel(event_id) removes an event; raises if unknown",
      "events_on(date) returns events whose interval intersects that calendar date",
      "free_slots(start, end, min_minutes) returns (slot_start, slot_end) gaps of at least min_minutes",
      "Use datetime / timedelta from the standard library",
    ],
    starter:
      "from datetime import datetime, timedelta, date\n\nclass Calendar:\n    pass\n",
  },
  {
    id: "stack-vm",
    title: "Stack VM (Forge-shaped)",
    difficulty: "Medium",
    minutes: 40,
    tags: ["interpreter", "dispatch"],
    statement:
      "Implement a small stack-based virtual machine. A program is a list of instruction strings. The VM has an integer stack. Run the program and return all values emitted by PRINT.\n\nInstructions:\n  PUSH n        push integer n\n  POP           discard top\n  ADD, SUB, MUL pop two, push result\n  DUP           duplicate top\n  SWAP          swap top two\n  PRINT         pop top and emit it\n  label:        a jump target (any line ending with :)\n  JMP label     unconditional jump\n  JZ label      jump if top of stack is zero (consumes top)",
    requirements: [
      "run(program) returns a list of emitted values in order",
      "Stack underflow, unknown instruction, and unknown label all raise",
      "Design dispatch so adding a new instruction is a one-place change",
      "Labels can appear before or after their jumps in the source",
    ],
    starter:
      "class StackVM:\n    pass\n\n# Example:\n# StackVM().run(['PUSH 5', 'PUSH 3', 'ADD', 'PRINT']) -> [8]\n",
  },
  {
    id: "library",
    title: "Library System",
    difficulty: "Medium",
    minutes: 40,
    tags: ["relationships", "constraints"],
    statement:
      "Model a library with Books, Members, and a Library. The library has multiple copies of books (identified by ISBN). Members can borrow books with a 14-day due date and may hold at most 3 books at a time.",
    requirements: [
      "Library.add_book(isbn, title, author, copies=1) stocks copies of a book",
      "Library.register(name) returns a new Member",
      "Library.borrow(member, isbn, now) creates a loan; raises if no copies left or member at borrow limit",
      "Library.return_book(member, isbn, now) closes a loan",
      "Library.overdue(now) returns [(member, book, days_overdue), ...]",
      "Library.member_status(member) returns current loans and days until each is due",
      "Inject `now` rather than calling datetime.now() inside the class — makes it testable",
    ],
    starter:
      "from datetime import datetime, timedelta\n\nclass Library:\n    pass\n",
  },
  {
    id: "file-system",
    title: "In-Memory File System",
    difficulty: "Hard",
    minutes: 45,
    tags: ["tree", "recursion"],
    statement:
      "Build an in-memory file system with slash-separated absolute paths. The root is '/'. Directories contain files and other directories.",
    requirements: [
      "mkdir(path, parents=False): create a directory. Raises if parent missing and parents=False. Raises if path exists.",
      "touch(path): create an empty file. Raises if path exists or parent missing.",
      "write(path, content): create the file if missing, otherwise overwrite. Parent must exist.",
      "read(path): return file content. Raises on missing path or directory.",
      "ls(path): return sorted list of immediate children names. Raises on missing path or non-directory.",
      "rm(path, recursive=False): remove a file, or an empty directory; recursive=True allows non-empty directories.",
      "find(start, name): list of full paths under start whose basename equals name.",
      "Use distinct types or attributes to distinguish files and directories.",
    ],
    starter: "class FileSystem:\n    pass\n",
  },
];
