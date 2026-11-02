# --- Kesit Python tarayıcı uyumluluk katmanı (Pyodide) ---
import sys
if sys.platform == "emscripten":
    import asyncio, asyncio.events, time as _t, threading, concurrent.futures as _cf
    _pp_sleep = _t.sleep   # öğrenci kodu time.sleep'i değiştirse de döngü etkilenmesin
    class _NoSel:
        def select(self, timeout=None):
            if timeout and timeout > 0: _pp_sleep(min(timeout, 5))
            return []
        def close(self): pass
    class _PPLoop(asyncio.BaseEventLoop):
        """JSPI gerektirmeyen, zamanlayıcı tabanlı olay döngüsü: sleep/gather/wait_for/Semaphore/Queue çalışır."""
        def __init__(self):
            super().__init__(); self._selector = _NoSel()
        def _process_events(self, event_list): pass
        def run_until_complete(self, future):
            prev = asyncio.events._get_running_loop()
            asyncio.events._set_running_loop(None)
            try: return super().run_until_complete(future)
            finally: asyncio.events._set_running_loop(prev)
        def run_forever(self):
            # Pyodide'nin kendi WebLoop'u "çalışıyor" görünebilir; bu döngüyü onun içinde eşzamanlı çalıştır.
            prev = asyncio.events._get_running_loop()
            asyncio.events._set_running_loop(None)
            try: return super().run_forever()
            finally: asyncio.events._set_running_loop(prev)
        def _write_to_self(self): pass
        def close(self):
            if not self.is_closed(): super().close()
    class _PPPolicy(asyncio.events.BaseDefaultEventLoopPolicy):
        _loop_factory = _PPLoop
    asyncio.set_event_loop_policy(_PPPolicy())
    asyncio.SelectorEventLoop = _PPLoop
    def _pp_async_run(main, *, debug=None, loop_factory=None):
        loop = _PPLoop(); asyncio.set_event_loop(loop)
        try: return loop.run_until_complete(main)
        finally:
            try: loop.run_until_complete(loop.shutdown_asyncgens())
            except Exception: pass
            asyncio.set_event_loop(None); loop.close()
    asyncio.run = _pp_async_run
    asyncio.Runner = None
    # İş parçacıkları: tarayıcıda gerçek thread yok. start() iş parçacığını sıraya koyar; hedef fonksiyon
    # join() çağrıldığında (ya da boş bir kuyruktan okunmak istendiğinde, ya da program sonunda) sırayla çalışır.
    import queue as _q
    _PENDING = []
    def _run_thread(th):
        if getattr(th, "_pp_done", False): return
        th._pp_done = True
        if th in _PENDING: _PENDING.remove(th)
        try: th.run()
        except BaseException as e:
            threading.excepthook(threading.ExceptHookArgs((type(e), e, e.__traceback__, th)))
    def _run_pending():
        while _PENDING: _run_thread(_PENDING[0])
    def _th_start(self):
        if getattr(self, "_pp_started", False): raise RuntimeError("threads can only be started once")
        self._pp_started = True; _PENDING.append(self)
    threading.Thread.start = _th_start
    threading.Thread.join = lambda self, timeout=None: _run_thread(self) if getattr(self, "_pp_started", False) else None
    threading.Thread.is_alive = lambda self: getattr(self, "_pp_started", False) and not getattr(self, "_pp_done", False)
    _orig_get = _q.Queue.get
    def _q_get(self, block=True, timeout=None):
        if block and self.empty():
            for th in list(_PENDING):
                if self.empty(): _run_thread(th)
            if self.empty():
                if timeout is not None: raise _q.Empty
                raise RuntimeError("Tarayıcı ortamında gerçek iş parçacığı yok: boş kuyruktan get() sonsuza dek bekler. Bu kodu kendi bilgisayarında dene.")
        return _orig_get(self, block, timeout)
    _q.Queue.get = _q_get
    _orig_wait = threading.Event.wait
    def _ev_wait(self, timeout=None):
        if not self.is_set(): _run_pending()
        if not self.is_set() and timeout is None:
            raise RuntimeError("Tarayıcı ortamında gerçek iş parçacığı yok: hiç kurulmayan Event.wait() sonsuza dek bekler.")
        return _orig_wait(self, 0 if not self.is_set() else timeout)
    threading.Event.wait = _ev_wait
    class _PPExecutor(_cf.Executor):
        def __init__(self, max_workers=None, *a, **k): self._max_workers = max_workers or 4
        def submit(self, fn, /, *args, **kwargs):
            f = _cf.Future()
            try: f.set_result(fn(*args, **kwargs))
            except BaseException as e: f.set_exception(e)
            return f
        def shutdown(self, wait=True, *, cancel_futures=False): pass
    _cf.ThreadPoolExecutor = _PPExecutor
    _cf.ProcessPoolExecutor = _PPExecutor
    async def _to_thread(func, /, *args, **kwargs): return func(*args, **kwargs)
    asyncio.to_thread = _to_thread
