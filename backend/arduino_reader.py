import json
import os
import random
import threading
import time

import serial

# $env:ARDUINO_PORT = "COM5" -> exec no terminal para definir a porta
PORTA = os.getenv("ARDUINO_PORT", "COM3")
BAUDRATE = 115200

_last_data = None
_stop_flag = False
_data_lock = threading.Lock()
_data_event = threading.Event()


def _open_serial_blocking():
    while not _stop_flag:
        try:
            ser = serial.Serial(PORTA, BAUDRATE, timeout=0.2)
            time.sleep(2)
            ser.reset_input_buffer()
            print(f"Conectado ao Arduino na porta {PORTA}")
            return ser
        except Exception as e:
            print(f"Nao foi possivel abrir a porta {PORTA}: {e}. Tentando novamente em 1 segundo...")
            time.sleep(1)


def _serial_loop():
    global _last_data
    while not _stop_flag:
        ser = _open_serial_blocking()
        while not _stop_flag:
            try:
                line = ser.readline().decode("utf-8", errors="ignore").strip()
                if not line:
                    continue
                if not (line.startswith("{") and line.endswith("}")):
                    continue
                data = json.loads(line)
                if isinstance(data, dict):
                    with _data_lock:
                        _last_data = data
                    _data_event.set()
            except (json.JSONDecodeError, UnicodeDecodeError):
                continue
            except Exception as e:
                print("Erro na leitura serial:", e)
                try:
                    ser.close()
                except Exception:
                    pass
                break


# inicia thread assim que o modulo e importado
threading.Thread(target=_serial_loop, daemon=True).start()


def _generate_fake_data():
    """Retorna leituras simuladas (6 FSR por pe, total 12 sensores)."""
    fake = {}
    for i in range(12):
        fake[f"fsr{i}"] = 2.5 + 2.5 * random.uniform(-0.9, 0.9)
        fake[f"fsr{i}"] = max(0, min(5, fake[f"fsr{i}"]))  # garante entre 0 e 5 V
    return fake


def read_pressure_data(timeout=1.0, allow_simulated=True):
    """
    Retorna o ultimo pacote recebido do Arduino.
    Se nada chegar dentro do timeout e allow_simulated=True, devolve dados fake.
    """
    got_data = _data_event.wait(timeout)
    if got_data:
        with _data_lock:
            if _last_data is not None:
                data_copy = dict(_last_data)
                _data_event.clear()
                return data_copy
    if allow_simulated:
        return _generate_fake_data()
    return None
